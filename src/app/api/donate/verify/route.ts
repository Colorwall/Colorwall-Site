import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ verified: false }, { status: 503 });
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(value => typeof value === "string") || !/^[a-f0-9]{64}$/.test(razorpay_signature)) throw new Error("Invalid response");
        const expected = createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest();
        const actual = Buffer.from(razorpay_signature, "hex");
        return NextResponse.json({ verified: timingSafeEqual(expected, actual) });
    } catch {
        return NextResponse.json({ verified: false }, { status: 400 });
    }
}
