import crypto from "crypto";
import {
    CREATOR_SPECIALTIES,
    normalizeHandle,
    validateHandle,
    type PublicCreatorProfile,
} from "@/lib/creator-types";

export { CREATOR_SPECIALTIES, normalizeHandle, validateHandle, type PublicCreatorProfile };

interface StoredCreatorRecord extends PublicCreatorProfile {
    emailHash: string;
    encryptedEmail: string;
    deviceId?: string;
    portfolioUrl?: string;
}

// in-memory fallback store used when running locally without MONGODB_URI
const localByHandle = new Map<string, StoredCreatorRecord>();
const localHandleByEmailHash = new Map<string, string>();

// derive aes-256 encryption key matching beta enrollment security pattern
function getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("fatal runtime security error: ENCRYPTION_SECRET must be set in production.");
        }
        return crypto.createHash("sha256").update("colorwall-dev-local-offline-secret-seed").digest();
    }
    return crypto.createHash("sha256").update(secret).digest();
}

function encryptEmail(email: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(email, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function toPublicProfile(record: StoredCreatorRecord): PublicCreatorProfile {
    return {
        creatorId: record.creatorId,
        handle: record.handle,
        displayName: record.displayName,
        specialty: record.specialty,
        source: record.source,
        verified: record.verified,
        profileUrl: record.profileUrl,
        deepLinkUrl: record.deepLinkUrl,
        createdAt: record.createdAt,
    };
}

// open short-lived mongodb client against colorwall database when configured
async function withCreatorsCollection<T>(
    fn: (col: import("mongodb").Collection<StoredCreatorRecord>) => Promise<T>
): Promise<T | null> {
    if (!process.env.MONGODB_URI) return null;
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
    });
    try {
        await client.connect();
        const col = client.db("ColorWall").collection<StoredCreatorRecord>("creators");
        return await fn(col);
    } finally {
        await client.close().catch(() => {});
    }
}

// check whether a normalized handle is valid and unclaimed across web and app registrations
export async function checkHandleAvailability(rawHandle: string): Promise<{
    available: boolean;
    handle: string;
    reason?: string;
}> {
    const validation = validateHandle(rawHandle);
    if (!validation.valid) {
        return { available: false, handle: validation.handle, reason: validation.reason };
    }

    const { handle } = validation;

    try {
        const dbExisting = await withCreatorsCollection(async (col) => {
            return col.findOne({ handle }, { projection: { handle: 1 } });
        });

        if (dbExisting) {
            return { available: false, handle, reason: `@${handle} is already claimed.` };
        }
    } catch (err) {
        console.warn("mongodb checkHandleAvailability fallback:", (err as Error).message);
    }

    if (localByHandle.has(handle)) {
        return { available: false, handle, reason: `@${handle} is already claimed.` };
    }

    return { available: true, handle };
}

// reserve a vanity @handle enforcing one claim per email hash across web and desktop app
export async function reserveCreatorHandle(input: {
    handle: string;
    email: string;
    displayName?: string;
    specialty?: string;
    source?: "App" | "Web";
    deviceId?: string;
    portfolioUrl?: string;
}): Promise<{
    success: boolean;
    creator?: PublicCreatorProfile;
    error?: string;
    status?: number;
}> {
    const validation = validateHandle(input.handle || "");
    if (!validation.valid) {
        return { success: false, error: validation.reason, status: 400 };
    }

    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { success: false, error: "Please enter a valid email address.", status: 400 };
    }

    const handle = validation.handle;
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const encryptedEmail = encryptEmail(email);
    const displayName = (input.displayName || handle).trim().slice(0, 48) || handle;
    const specialty = (input.specialty || CREATOR_SPECIALTIES[0]).trim().slice(0, 48);
    const source: "App" | "Web" = input.source === "App" ? "App" : "Web";
    const creatorId = `CW-CR-${crypto.createHash("sha256").update(`${handle}:${emailHash}`).digest("hex").slice(0, 6).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const record: StoredCreatorRecord = {
        creatorId,
        handle,
        displayName,
        specialty,
        source,
        verified: false,
        profileUrl: `https://colorwall.xyz/@${handle}`,
        deepLinkUrl: `colorwall://creator?handle=${encodeURIComponent(handle)}&id=${encodeURIComponent(creatorId)}`,
        createdAt,
        emailHash,
        encryptedEmail,
        ...(input.deviceId ? { deviceId: String(input.deviceId).slice(0, 128) } : {}),
        ...(input.portfolioUrl ? { portfolioUrl: String(input.portfolioUrl).trim().slice(0, 200) } : {}),
    };

    try {
        const dbOutcome = await withCreatorsCollection(async (col) => {
            await col.createIndex({ handle: 1 }, { unique: true }).catch(() => {});
            await col.createIndex({ emailHash: 1 }, { unique: true }).catch(() => {});

            const existingByEmail = await col.findOne({ emailHash });
            if (existingByEmail) {
                return {
                    conflict: true as const,
                    error: `This email already reserved @${existingByEmail.handle}. Limit 1 handle per email.`,
                };
            }

            const existingByHandle = await col.findOne({ handle });
            if (existingByHandle) {
                return {
                    conflict: true as const,
                    error: `@${handle} is already claimed. Try another handle.`,
                };
            }

            await col.insertOne(record);
            return { conflict: false as const };
        });

        if (dbOutcome) {
            if (dbOutcome.conflict) {
                return { success: false, error: dbOutcome.error, status: 409 };
            }
            return { success: true, creator: toPublicProfile(record), status: 201 };
        }
    } catch (err) {
        console.warn("mongodb reserveCreatorHandle fallback:", (err as Error).message);
    }

    const existingLocalHandle = localHandleByEmailHash.get(emailHash);
    if (existingLocalHandle) {
        return {
            success: false,
            error: `This email already reserved @${existingLocalHandle}. Limit 1 handle per email.`,
            status: 409,
        };
    }
    if (localByHandle.has(handle)) {
        return { success: false, error: `@${handle} is already claimed. Try another handle.`, status: 409 };
    }

    localByHandle.set(handle, record);
    localHandleByEmailHash.set(emailHash, handle);

    return { success: true, creator: toPublicProfile(record), status: 201 };
}

// fetch public creator profile by normalized handle for /@handle vanity route
export async function getCreatorByHandle(rawHandle: string): Promise<PublicCreatorProfile | null> {
    const handle = normalizeHandle(rawHandle);
    if (!handle) return null;

    try {
        const found = await withCreatorsCollection(async (col) => {
            return col.findOne({ handle });
        });
        if (found) return toPublicProfile(found);
    } catch (err) {
        console.warn("mongodb getCreatorByHandle fallback:", (err as Error).message);
    }

    const local = localByHandle.get(handle);
    return local ? toPublicProfile(local) : null;
}

// lookup existing creator reservation by verified account email hash for one-time onboarding redirect
export async function getCreatorByEmail(rawEmail: string): Promise<PublicCreatorProfile | null> {
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email) return null;

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    try {
        const found = await withCreatorsCollection(async (col) => {
            return col.findOne({ emailHash });
        });
        if (found) return toPublicProfile(found);
    } catch (err) {
        console.warn("mongodb getCreatorByEmail fallback:", (err as Error).message);
    }

    const localHandle = localHandleByEmailHash.get(emailHash);
    if (!localHandle) return null;
    const local = localByHandle.get(localHandle);
    return local ? toPublicProfile(local) : null;
}

// fetch aggregate reservation count and recent public creator handles
export async function getCreatorStats(limit = 8): Promise<{
    totalReserved: number;
    recent: PublicCreatorProfile[];
}> {
    try {
        const result = await withCreatorsCollection(async (col) => {
            const totalReserved = await col.countDocuments();
            const docs = await col
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
            return {
                totalReserved,
                recent: docs.map(toPublicProfile),
            };
        });
        if (result) return result;
    } catch (err) {
        console.warn("mongodb getCreatorStats fallback:", (err as Error).message);
    }

    const allLocal = Array.from(localByHandle.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
    );
    return {
        totalReserved: allLocal.length,
        recent: allLocal.slice(0, limit).map(toPublicProfile),
    };
}
