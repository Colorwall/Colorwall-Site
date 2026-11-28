import Redis from "ioredis";

declare global {
    // eslint-disable-next-line no-var
    var __cwRedis: Redis | undefined;
}

// shared upstash redis singleton with strict tls verification and fast failback
export async function getRedis(): Promise<Redis | null> {
    const url = process.env.REDIS_URL;
    if (!url) return null;

    if (!globalThis.__cwRedis) {
        const isTls = url.startsWith("rediss://");
        globalThis.__cwRedis = new Redis(url, {
            tls: isTls ? {} : undefined,
            connectTimeout: 2500,
            commandTimeout: 2000,
            maxRetriesPerRequest: 1,
            lazyConnect: true,
        });

        globalThis.__cwRedis.on("error", (err) => {
            console.warn("redis connection warning:", err.message);
        });
    }

    if (globalThis.__cwRedis.status === "wait") {
        try {
            await globalThis.__cwRedis.connect();
        } catch {
            return null;
        }
    }

    return globalThis.__cwRedis;
}

// simple fixed-window ip rate limiter backed by upstash redis
export async function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    const redis = await getRedis();
    if (!redis) return true;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, windowSeconds);
        }
        return count <= maxRequests;
    } catch {
        return true;
    }
}
