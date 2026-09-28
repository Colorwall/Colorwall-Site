import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// in-memory cache keyed by target symbol to prevent cross-coin contamination
interface CachedOiEntry {
    data: any;
    updatedAtMs: number;
}
const symbolCache = new Map<string, CachedOiEntry>();

// cors headers allowing universal access from any external frontend, trading bot, or script
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-sync-secret',
};

// options handler for cors preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

// public get endpoint: callable by anyone without authentication
// validates requested targetSymbol and returns exact symbol metrics with freshness metadata
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const requestedSymbol = (searchParams.get('targetSymbol') || searchParams.get('symbol') || 'BTC').toUpperCase();

        const now = Date.now();

        // 1. check hot memory cache for the specific requested symbol
        const cached = symbolCache.get(requestedSymbol);
        if (cached && (now - cached.updatedAtMs < 30_000)) {
            const ageSeconds = Math.round((now - cached.updatedAtMs) / 1000);
            return NextResponse.json(
                {
                    success: true,
                    meta: {
                        targetSymbol: requestedSymbol,
                        source: 'memory_cache',
                        cacheAgeSeconds: ageSeconds,
                        isFresh: ageSeconds < 900,
                        refreshCadence: '10m',
                        lastSyncedUtc: new Date(cached.updatedAtMs).toISOString(),
                    },
                    data: cached.data,
                },
                {
                    status: 200,
                    headers: {
                        ...CORS_HEADERS,
                        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                    },
                }
            );
        }

        // 2. retrieve symbol-specific record from mongodb
        try {
            const db = await getDb();
            const collection = db.collection('market_metrics');
            const record = await collection.findOne({
                metric: 'aggregated_open_interest',
                targetSymbol: requestedSymbol,
            });

            if (record && record.data) {
                const updatedEpoch = record.updated_at_epoch_ms || now;
                symbolCache.set(requestedSymbol, {
                    data: record.data,
                    updatedAtMs: updatedEpoch,
                });

                const ageSeconds = Math.round((now - updatedEpoch) / 1000);
                return NextResponse.json(
                    {
                        success: true,
                        meta: {
                            targetSymbol: requestedSymbol,
                            source: 'database',
                            cacheAgeSeconds: ageSeconds,
                            isFresh: ageSeconds < 900,
                            refreshCadence: '10m',
                            lastSyncedUtc: record.updated_at || new Date(updatedEpoch).toISOString(),
                        },
                        data: record.data,
                    },
                    {
                        status: 200,
                        headers: {
                            ...CORS_HEADERS,
                            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                        },
                    }
                );
            }
        } catch (dbErr) {
            console.warn(`[open-interest-api] database lookup warning for ${requestedSymbol}:`, dbErr);
        }

        // 3. fallback to cached memory entry if db was unreachable
        if (cached) {
            const ageSeconds = Math.round((now - cached.updatedAtMs) / 1000);
            return NextResponse.json(
                {
                    success: true,
                    meta: {
                        targetSymbol: requestedSymbol,
                        source: 'memory_fallback',
                        cacheAgeSeconds: ageSeconds,
                        isFresh: ageSeconds < 900,
                        refreshCadence: '10m',
                        lastSyncedUtc: new Date(cached.updatedAtMs).toISOString(),
                    },
                    data: cached.data,
                },
                { status: 200, headers: CORS_HEADERS }
            );
        }

        // 4. symbol not found or unsupported: return explicit 404 to prevent trading bots from misinterpreting data
        return NextResponse.json(
            {
                success: false,
                error: 'unsupported_symbol',
                requestedSymbol,
                supportedSymbols: ['BTC'],
                message: `macro 22-exchange aggregated open interest is currently only calibrated for BTC. token '${requestedSymbol}' is not currently tracked by this sovereign endpoint.`,
            },
            {
                status: 404,
                headers: CORS_HEADERS,
            }
        );
    } catch (e) {
        console.error('[open-interest-api] unexpected get error:', e);
        return NextResponse.json(
            { success: false, error: 'internal server error' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

// secure post endpoint: requires authentication header
// accepts the latest summary.json generated by the local sovereign engine for a given symbol
export async function POST(req: Request) {
    try {
        // 1. authenticate caller via x-sync-secret or bearer token
        const authHeader = req.headers.get('authorization') || '';
        const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        const syncSecret = req.headers.get('x-sync-secret') || bearerToken;

        const expectedSecret = process.env.OI_SYNC_SECRET || process.env.ADMIN_PASSKEY;

        if (!expectedSecret || syncSecret !== expectedSecret) {
            return NextResponse.json(
                { success: false, error: 'unauthorized: invalid or missing sync secret' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        // 2. parse received open interest summary payload
        const payload = await req.json();
        if (!payload || typeof payload !== 'object') {
            return NextResponse.json(
                { success: false, error: 'invalid payload: expected json object' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const targetSymbol = (payload.targetSymbol || 'BTC').toUpperCase();
        const now = new Date();

        // 3. update symbol-specific in-memory hot cache
        symbolCache.set(targetSymbol, {
            data: payload,
            updatedAtMs: now.getTime(),
        });

        // 4. persist snapshot into mongodb collection 'market_metrics' indexed by symbol
        try {
            const db = await getDb();
            const collection = db.collection('market_metrics');
            await collection.updateOne(
                {
                    metric: 'aggregated_open_interest',
                    targetSymbol,
                },
                {
                    $set: {
                        metric: 'aggregated_open_interest',
                        targetSymbol,
                        data: payload,
                        updated_at: now.toISOString(),
                        updated_at_epoch_ms: now.getTime(),
                    },
                },
                { upsert: true }
            );
        } catch (dbErr) {
            console.warn(`[open-interest-api] database persistence warning for ${targetSymbol} (cached in memory):`, dbErr);
        }

        return NextResponse.json(
            {
                success: true,
                targetSymbol,
                message: `open interest summary for ${targetSymbol} synchronized successfully`,
                updated_at: now.toISOString(),
            },
            { status: 200, headers: CORS_HEADERS }
        );
    } catch (e) {
        console.error('[open-interest-api] post sync error:', e);
        return NextResponse.json(
            { success: false, error: 'failed to process sync payload' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
