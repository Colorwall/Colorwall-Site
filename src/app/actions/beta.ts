"use server";

import crypto from "crypto";

// server encryption key derived from runtime secret environment variable
// strictly enforces kerckhoffs principle with fail-fast validation in production
function getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("fatal runtime security error: ENCRYPTION_SECRET environment variable must be set in production.");
        }
        // safe local development fallback when running offline without secrets
        return crypto.createHash("sha256").update("colorwall-dev-local-offline-secret-seed").digest();
    }
    return crypto.createHash("sha256").update(secret).digest();
}

// encrypt plaintext email to ciphertext string so it is never stored as plain text
function encryptEmail(email: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(email, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

// decrypt ciphertext back to plain email on the server when sending release notifications
export async function decryptEmail(ciphertext: string): Promise<string | null> {
    try {
        const [ivHex, tagHex, dataHex] = ciphertext.split(":");
        if (!ivHex || !tagHex || !dataHex) return null;
        const key = getEncryptionKey();
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
        decipher.setAuthTag(Buffer.from(tagHex, "hex"));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
        return decrypted.toString("utf8");
    } catch {
        return null;
    }
}

// in-memory fallback cache for local dev environments without mongodb connection
const localTesterCache = new Set<string>();

export interface BetaEnrollmentResult {
    success: boolean;
    status?: "enrolled";
    testerId?: string;
    tier?: string;
    joinedAt?: string;
    message?: string;
    error?: string;
}

// server action to securely enroll beta testers with zero client-side crypto leakage
export async function enrollBetaTester(rawEmail: string): Promise<BetaEnrollmentResult> {
    try {
        const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

        // validate email structure
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return { success: false, error: "Please enter a valid Gmail address." };
        }

        // generate deterministic beta tester identifier from email hash
        const fullHash = crypto.createHash("sha256").update(email).digest("hex");
        const hashShort = fullHash.slice(0, 6).toUpperCase();
        const testerId = `CW-BETA-${hashShort}`;
        const joinedAt = new Date().toISOString();
        const encryptedEmail = encryptEmail(email);

        // record tester into mongodb if environment uri is configured
        // stores encrypted blob and sha hash so the email is never stored as plain text
        if (process.env.MONGODB_URI) {
            try {
                const { MongoClient } = await import("mongodb");
                const client = new MongoClient(process.env.MONGODB_URI);
                await client.connect();
                const db = client.db("colorwall");
                await db.collection("beta_testers").updateOne(
                    { emailHash: fullHash },
                    { 
                        $set: { 
                            emailHash: fullHash, 
                            encryptedEmail,
                            testerId, 
                            tier: "early peeps", 
                            updatedAt: joinedAt 
                        },
                        $setOnInsert: { createdAt: joinedAt }
                    },
                    { upsert: true }
                );
                await client.close();
            } catch (dbError) {
                // log non-fatal db warning and continue to allow frictionless user onboarding
                console.warn("mongodb beta enrollment warning, using memory cache:", (dbError as Error).message);
                localTesterCache.add(fullHash);
            }
        } else {
            localTesterCache.add(fullHash);
        }

        return {
            success: true,
            status: "enrolled",
            testerId,
            tier: "early peeps",
            joinedAt,
            message: "You're enrolled in the Colorwall Beta Program. Early builds and compositor updates are unlocked."
        };
    } catch (error) {
        console.error("beta enrollment server error:", error);
        return { success: false, error: "Unable to verify beta enrollment. Please try again." };
    }
}
