import crypto from "crypto";
import {
    normalizeHandle,
    validateHandle,
    type PublicCreatorProfile,
} from "@/lib/creator-types";
import { getRedis } from "@/lib/redis";

export { normalizeHandle, validateHandle, type PublicCreatorProfile };

const REDIS_HANDLES_SET = "creators:handles";
const REDIS_EMAIL_TO_HANDLE = "creators:email_to_handle";
const redisProfileKey = (handle: string) => `creators:profile:${handle}`;

interface StoredCreatorRecord extends PublicCreatorProfile {
    emailHash: string;
    encryptedEmail: string;
    deviceId?: string;
    portfolioUrl?: string;
}

// in-memory fallback store used when running locally without MONGODB_URI or REDIS_URL
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
        source: record.source,
        verified: record.verified,
        profileUrl: record.profileUrl,
        deepLinkUrl: record.deepLinkUrl,
        createdAt: record.createdAt,
    };
}

// open short-lived mongodb client against ColorWall database when configured
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

async function cacheCreatorInRedis(profile: PublicCreatorProfile, emailHash?: string) {
    const redis = getRedis();
    if (!redis) return;
    try {
        const pipeline = redis.pipeline();
        pipeline.sadd(REDIS_HANDLES_SET, profile.handle);
        pipeline.set(redisProfileKey(profile.handle), JSON.stringify(profile), "EX", 3600);
        if (emailHash) {
            pipeline.hset(REDIS_EMAIL_TO_HANDLE, emailHash, profile.handle);
        }
        await pipeline.exec();
    } catch {
        // non-fatal redis cache write failure
    }
}

// check whether a normalized handle is valid and unclaimed (redis o(1) set first, then mongodb)
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

    const redis = getRedis();
    if (redis) {
        try {
            const inRedis = await redis.sismember(REDIS_HANDLES_SET, handle);
            if (inRedis === 1) {
                return { available: false, handle, reason: `@${handle} is already claimed.` };
            }
        } catch {
            // fallback to mongodb when redis is unreachable
        }
    }

    try {
        const dbExisting = await withCreatorsCollection(async (col) => {
            return col.findOne({ handle });
        });

        if (dbExisting) {
            await cacheCreatorInRedis(toPublicProfile(dbExisting), dbExisting.emailHash);
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

// reserve a vanity @handle enforcing one claim per email hash with redis pre-check + unique db indexes
export async function reserveCreatorHandle(input: {
    handle: string;
    email: string;
    displayName?: string;
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

    // fast redis guard: reject duplicate claims or taken handles before touching mongodb
    const redis = getRedis();
    if (redis) {
        try {
            const [existingHandle, handleTaken] = await Promise.all([
                redis.hget(REDIS_EMAIL_TO_HANDLE, emailHash),
                redis.sismember(REDIS_HANDLES_SET, handle),
            ]);

            if (existingHandle) {
                return {
                    success: false,
                    error: `You already own @${existingHandle}. Limit 1 handle per account.`,
                    status: 409,
                };
            }
            if (handleTaken === 1) {
                return {
                    success: false,
                    error: `@${handle} is already claimed. Try another handle.`,
                    status: 409,
                };
            }
        } catch {
            // proceed to mongodb atomic check if redis fails
        }
    }

    const encryptedEmail = encryptEmail(email);
    const displayName = (input.displayName || handle).trim().slice(0, 48) || handle;
    const source: "App" | "Web" = input.source === "App" ? "App" : "Web";
    const creatorId = `CW-CR-${crypto.createHash("sha256").update(`${handle}:${emailHash}`).digest("hex").slice(0, 6).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const record: StoredCreatorRecord = {
        creatorId,
        handle,
        displayName,
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
                await cacheCreatorInRedis(toPublicProfile(existingByEmail), emailHash);
                return {
                    conflict: true as const,
                    error: `You already own @${existingByEmail.handle}. Limit 1 handle per account.`,
                };
            }

            const existingByHandle = await col.findOne({ handle });
            if (existingByHandle) {
                await cacheCreatorInRedis(toPublicProfile(existingByHandle), existingByHandle.emailHash);
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
            const publicProfile = toPublicProfile(record);
            await cacheCreatorInRedis(publicProfile, emailHash);
            return { success: true, creator: publicProfile, status: 201 };
        }
    } catch (err) {
        console.warn("mongodb reserveCreatorHandle fallback:", (err as Error).message);
    }

    const existingLocalHandle = localHandleByEmailHash.get(emailHash);
    if (existingLocalHandle) {
        return {
            success: false,
            error: `You already own @${existingLocalHandle}. Limit 1 handle per account.`,
            status: 409,
        };
    }
    if (localByHandle.has(handle)) {
        return { success: false, error: `@${handle} is already claimed. Try another handle.`, status: 409 };
    }

    localByHandle.set(handle, record);
    localHandleByEmailHash.set(emailHash, handle);
    const publicProfile = toPublicProfile(record);
    await cacheCreatorInRedis(publicProfile, emailHash);

    return { success: true, creator: publicProfile, status: 201 };
}

// fetch public creator profile by normalized handle (redis first, mongodb fallback)
export async function getCreatorByHandle(rawHandle: string): Promise<PublicCreatorProfile | null> {
    const handle = normalizeHandle(rawHandle);
    if (!handle) return null;

    const redis = getRedis();
    if (redis) {
        try {
            const cached = await redis.get(redisProfileKey(handle));
            if (cached) {
                return JSON.parse(cached) as PublicCreatorProfile;
            }
        } catch {
            // fallback to mongodb
        }
    }

    try {
        const found = await withCreatorsCollection(async (col) => {
            return col.findOne({ handle });
        });
        if (found) {
            const profile = toPublicProfile(found);
            await cacheCreatorInRedis(profile, found.emailHash);
            return profile;
        }
    } catch (err) {
        console.warn("mongodb getCreatorByHandle fallback:", (err as Error).message);
    }

    const local = localByHandle.get(handle);
    return local ? toPublicProfile(local) : null;
}

// lookup existing creator reservation by verified account email hash (redis first, mongodb fallback)
export async function getCreatorByEmail(rawEmail: string): Promise<PublicCreatorProfile | null> {
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email) return null;

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    const redis = getRedis();
    if (redis) {
        try {
            const cachedHandle = await redis.hget(REDIS_EMAIL_TO_HANDLE, emailHash);
            if (cachedHandle) {
                const profile = await getCreatorByHandle(cachedHandle);
                if (profile) return profile;
            }
        } catch {
            // fallback to mongodb
        }
    }

    try {
        const found = await withCreatorsCollection(async (col) => {
            return col.findOne({ emailHash });
        });
        if (found) {
            const profile = toPublicProfile(found);
            await cacheCreatorInRedis(profile, emailHash);
            return profile;
        }
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
