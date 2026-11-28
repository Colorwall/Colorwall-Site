import Redis from "ioredis";

declare global {
    // eslint-disable-next-line no-var
    var __cwRedis: Redis | undefined;
}

// shared upstash redis singleton with short timeouts and graceful fallback
export function getRedis(): Redis | null {
    const url = process.env.REDIS_URL;
    if (!url) return null;

    if (!globalThis.__cwRedis) {
        const isTls = url.startsWith("rediss://");
        globalThis.__cwRedis = new Redis(url, {
            tls: isTls ? { rejectUnauthorized: false } : undefined,
            connectTimeout: 2500,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true,
        });

        globalThis.__cwRedis.on("error", (err) => {
            console.warn("redis connection warning:", err.message);
        });
    }

    return globalThis.__cwRedis;
}
