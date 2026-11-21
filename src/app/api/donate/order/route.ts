import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) return NextResponse.json({ error: "Fiat donations are not available yet. Please try crypto in the meantime." }, { status: 503 });

    let amount: unknown;
    let currency: unknown;
    try { ({ amount, currency = "USD" } = await request.json()); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 100 || amount > 100000000) {
        return NextResponse.json({ error: "Enter an amount between 1 and 1,000,000 in the selected currency." }, { status: 400 });
    }
    if (typeof currency !== "string" || !["INR", "USD", "EUR", "GBP", "CAD", "AUD"].includes(currency)) {
        return NextResponse.json({ error: "Please select a supported currency." }, { status: 400 });
    }
    try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" },
            body: JSON.stringify({ amount, currency, receipt: `donate_${crypto.randomUUID().replaceAll("-", "")}` }),
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Order creation failed");
        const order = await response.json();
        return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency, key });
    } catch {
        return NextResponse.json({ error: "Could not start checkout. Please try again or choose another currency." }, { status: 502 });
    }
}
