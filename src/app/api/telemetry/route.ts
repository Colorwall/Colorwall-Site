import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

function sanitizeString(value: string | null | undefined): string {
    if (!value) return 'Unknown';
    return value
        .replace(/\0/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .trim();
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const deviceId = sanitizeString(body.device_id);
        if (!deviceId || deviceId === 'Unknown') {
            return NextResponse.json({ success: false, error: 'Missing device_id' }, { status: 400 });
        }

        const appVersion = sanitizeString(body.app_version).slice(0, 32);
        const osName = sanitizeString(body.os_name).slice(0, 64);
        const osVersion = sanitizeString(body.os_version).slice(0, 64);
        const cpuBrand = sanitizeString(body.cpu_brand).slice(0, 128);
        const ramGb = Number(body.ram_gb) || 0;
        
        // We use Vercel KV sets (SADD) to store unique device IDs per category.
        // This ensures if a user opens the app 100 times, they are only counted once in each category.
        
        const pipeline = kv.pipeline();

        // 1. Total Unique Devices
        pipeline.sadd('telemetry:total_devices', deviceId);

        // 2. App Versions Distribution
        if (appVersion !== 'Unknown') {
            pipeline.sadd(`telemetry:app_version:${appVersion}`, deviceId);
        }

        // 3. OS Versions
        if (osVersion !== 'Unknown') {
            pipeline.sadd(`telemetry:os_version:${osVersion}`, deviceId);
        }
        
        // 4. OS Name (e.g. Windows)
        if (osName !== 'Unknown') {
            pipeline.sadd(`telemetry:os_name:${osName}`, deviceId);
        }

        // 5. CPU Brands
        if (cpuBrand !== 'Unknown') {
            pipeline.sadd(`telemetry:cpu_brand:${cpuBrand}`, deviceId);
        }

        // 6. RAM Buckets (e.g. 8GB, 16GB, 32GB)
        if (ramGb > 0) {
            let ramBucket = 'Other';
            if (ramGb <= 4) ramBucket = '<= 4GB';
            else if (ramGb <= 8) ramBucket = '8GB';
            else if (ramGb <= 16) ramBucket = '16GB';
            else if (ramGb <= 32) ramBucket = '32GB';
            else ramBucket = '> 32GB';
            
            pipeline.sadd(`telemetry:ram:${ramBucket}`, deviceId);
        }

        await pipeline.exec();

        return NextResponse.json({ success: true }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error) {
        console.error('[telemetry/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
