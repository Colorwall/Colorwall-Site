import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

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
        
        let ramBucket = 'Other';
        if (ramGb > 0) {
            if (ramGb <= 4) ramBucket = '<= 4GB';
            else if (ramGb <= 8) ramBucket = '8GB';
            else if (ramGb <= 16) ramBucket = '16GB';
            else if (ramGb <= 32) ramBucket = '32GB';
            else ramBucket = '> 32GB';
        }

        const db = await getDb();
        
        // Upsert the device telemetry record
        await db.collection('telemetry').updateOne(
            { device_id: deviceId },
            { 
                $set: {
                    app_version: appVersion,
                    os_version: osVersion,
                    os_name: osName,
                    cpu_brand: cpuBrand,
                    ram_bucket: ramBucket,
                    ram_gb: ramGb,
                    last_ping: new Date()
                },
                $setOnInsert: {
                    first_seen: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error) {
        console.error('[telemetry/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
