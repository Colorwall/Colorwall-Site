import { NextResponse } from "next/server";

// backend razorpay order creation route for handling one time donations
export async function POST(request: Request) {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) {
        return NextResponse.json(
            { error: "Fiat donations are not configured yet. Please configure Razorpay keys in environment variables." },
            { status: 503 }
        );
    }

    let amount: unknown;
    let currency: unknown;
    try {
        ({ amount, currency = "USD" } = await request.json());
    } catch {
        return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // validate integer amount in minor currency units (cents or paise)
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 100 || amount > 100000000) {
        return NextResponse.json(
            { error: "Enter an amount between 1 and 1,000,000 in the selected currency." },
            { status: 400 }
        );
    }

    // check allowed currency codes
    if (typeof currency !== "string" || !["INR", "USD", "EUR", "GBP", "CAD", "AUD"].includes(currency)) {
        return NextResponse.json({ error: "Please select a supported currency." }, { status: 400 });
    }

    try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                currency,
                receipt: `donate_${crypto.randomUUID().replaceAll("-", "")}`,
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error("Order creation failed on razorpay api");
        }

        const order = await response.json();
        return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency, key });
    } catch {
        return NextResponse.json(
            { error: "Could not start checkout. Please try again or choose another currency." },
            { status: 502 }
        );
    }
}
