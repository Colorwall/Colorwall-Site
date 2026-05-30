import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { passkey } = body;

        const correctPasskey = process.env.ADMIN_PASSKEY;

        if (!correctPasskey) {
            return NextResponse.json({ success: false, error: 'Admin passkey not configured on server.' }, { status: 500 });
        }

        if (passkey === correctPasskey) {
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
            const response = NextResponse.json({ success: true, ip });
            
            // Set cookie for 7 days
            response.cookies.set({
                name: 'cw_admin_token',
                value: passkey,
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            return response;
        }

        return NextResponse.json({ success: false, error: 'Invalid passkey.' }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/cw_admin_token=([^;]+)/);
    const passkey = match ? match[1] : null;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

    if (passkey && passkey === process.env.ADMIN_PASSKEY) {
        return NextResponse.json({ isAdmin: true, ip });
    }
    return NextResponse.json({ isAdmin: false, ip });
}

