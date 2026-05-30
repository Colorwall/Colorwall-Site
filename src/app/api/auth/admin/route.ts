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
            const response = NextResponse.json({ success: true });
            
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

    if (passkey && passkey === process.env.ADMIN_PASSKEY) {
        return NextResponse.json({ isAdmin: true });
    }
    return NextResponse.json({ isAdmin: false });
}

