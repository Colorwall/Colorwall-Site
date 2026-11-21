"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useTheme } from "@/app/contexts/ThemeContext";

const currencies = {
    INR: { symbol: "\u20b9", label: "Indian rupee", presets: [100, 500, 1000] },
    USD: { symbol: "$", label: "US dollar", presets: [5, 10, 25] },
    EUR: { symbol: "\u20ac", label: "Euro", presets: [5, 10, 25] },
    GBP: { symbol: "\u00a3", label: "British pound", presets: [5, 10, 25] },
    CAD: { symbol: "CA$", label: "Canadian dollar", presets: [5, 10, 25] },
    AUD: { symbol: "A$", label: "Australian dollar", presets: [5, 10, 25] },
} as const;
type Currency = keyof typeof currencies;

const address = "lq1qqwtc98th06ulteyzkegdu8rtyetmrrlcxakml0qtcqgpq3f2tq5j0t0vpx3au2wnpkrthtre4alqlt7z0dc9z0zj0an7wwezt";
type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type CheckoutOptions = { key: string; amount: number; currency: string; order_id: string; name: string; description: string; theme: { color: string }; handler: (response: PaymentResponse) => void; modal: { ondismiss: () => void } };
declare global { interface Window { Razorpay?: new (options: CheckoutOptions) => { open: () => void } } }

function loadCheckout(): Promise<boolean> {
    if (window.Razorpay) return Promise.resolve(true);
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function DonateClient() {
    const { theme } = useTheme();
    const dark = theme === "dark";
    const [method, setMethod] = useState<"fiat" | "crypto">("fiat");
    const [currency, setCurrency] = useState<Currency>("USD");
    const [amount, setAmount] = useState("10");
    const selectedCurrency = currencies[currency];
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState(false);
    const muted = dark ? "text-slate-400" : "text-slate-600";

    async function donate() {
        const value = Number(amount);
        const minorUnits = Math.round(value * 100);
        if (!Number.isFinite(value) || value < 1 || value > 1000000 || Math.abs(value * 100 - minorUnits) > 0.000001) { setMessage(`Enter an amount between ${selectedCurrency.symbol}1 and ${selectedCurrency.symbol}1,000,000, with up to two decimal places.`); return; }
        setBusy(true); setMessage("");
        try {
            if (!await loadCheckout() || !window.Razorpay) throw new Error("Checkout could not load. Please check your connection and try again.");
            const res = await fetch("/api/donate/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: minorUnits, currency }) });
            const order = await res.json();
            if (!res.ok) throw new Error(order.error);
            if (!order.id || !order.key || order.amount !== minorUnits || order.currency !== currency) throw new Error("Checkout could not start. Please try again.");
            const checkout = new window.Razorpay({
                key: order.key, amount: order.amount, currency: order.currency, order_id: order.id,
                name: "ColorWall", description: "Support ColorWall", theme: { color: "#008bea" },
                handler: async (response) => {
                    try {
                        const verification = await fetch("/api/donate/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response) });
                        const result = await verification.json();
                        setMessage(result.verified ? "Thank you for supporting ColorWall! Your payment was submitted successfully." : "We couldn't verify your payment. Please check your Razorpay receipt.");
                    } catch { setMessage("We couldn't verify your payment. Please check your Razorpay receipt."); }
                    setBusy(false);
                },
                modal: { ondismiss: () => setBusy(false) },
            });
            checkout.open();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again."); setBusy(false); }
    }

    async function copyAddress() {
        try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
        catch { setMessage("Could not copy the address. Please select and copy it manually."); }
    }

    const field = dark ? "border-white/15 bg-white/[0.04]" : "border-black/15 bg-black/[0.02]";
    const rule = dark ? "border-white/15" : "border-black/15";

    return <>
        <main className={`relative overflow-hidden px-5 pb-24 pt-32 sm:px-10 sm:pt-40 lg:px-16 ${dark ? "text-white" : "text-slate-950"}`}>
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.8fr)] lg:gap-20 xl:gap-28">
                    <header className="max-w-2xl lg:pt-3">
                        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">Support ColorWall / 01</p>
                        <h1 className="mt-7 font-outfit text-5xl font-light leading-[0.98] tracking-[-0.045em] sm:text-7xl xl:text-[5.5rem]">Keep your desktop <span className="text-sky-500">colorful.</span></h1>
                        <p className={`mt-7 max-w-lg text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>ColorWall is free for everyone. If it has made your desktop a little more yours, you can help us keep building it.</p>
                        <div className={`mt-12 max-w-lg border-t pt-6 sm:mt-16 ${rule}`}>
                            <p className="font-outfit text-2xl font-light tracking-tight sm:text-3xl">Made for your desktop.<br />Made possible by you.</p>
                            <p className={`mt-4 max-w-sm text-sm leading-6 ${muted}`}>Your support goes toward the continued development of ColorWall. Thank you for being part of it.</p>
                        </div>
                    </header>

                    <section aria-labelledby="donation-heading" className={`rounded-2xl border p-6 sm:p-8 ${dark ? "border-white/10 bg-[#111820]" : "border-slate-200 bg-white"}`}>
                        <div className={`flex items-start justify-between gap-4 border-b pb-6 ${rule}`}>
                            <div><p className={`font-mono text-xs uppercase tracking-widest ${muted}`}>One-time contribution</p><h2 id="donation-heading" className="mt-3 font-outfit text-3xl font-medium tracking-tight">Support the project</h2></div>
                            <span aria-hidden="true" className="font-outfit text-3xl font-light text-sky-500">{method === "fiat" ? selectedCurrency.symbol : ""}</span>
                        </div>
                        <div className={`mt-6 grid grid-cols-2 gap-1 rounded-lg p-1 ${dark ? "bg-black/30" : "bg-slate-100"}`} role="group" aria-label="Donation method">
                            {(["fiat", "crypto"] as const).map(item => <button key={item} type="button" onClick={() => { setMethod(item); setMessage(""); }} aria-pressed={method === item} className={`min-h-12 rounded-md px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${method === item ? (dark ? "bg-white/10 text-white" : "bg-white text-slate-950 shadow-sm") : `${muted} hover:text-sky-500`}`}>{item === "fiat" ? "Currency" : "Crypto"}</button>)}
                        </div>
                        {method === "fiat" ? <div className="mt-8">
                            <label htmlFor="currency" className="text-sm font-semibold">Currency</label>
                            <div className={`relative mt-3 flex min-h-14 items-center rounded-lg border transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 ${field}`}>
                                <span aria-hidden="true" className={`ml-4 flex h-9 min-w-9 items-center justify-center rounded-md px-2 font-outfit text-lg ${dark ? "bg-white/10" : "bg-black/5"}`}>{selectedCurrency.symbol}</span>
                                <span aria-hidden="true" className="pointer-events-none ml-3 flex flex-1 items-baseline gap-2"><span className="text-sm font-semibold">{currency}</span><span className={`text-sm ${muted}`}>{selectedCurrency.label}</span></span>
                                <ChevronDown aria-hidden="true" size={18} className={`pointer-events-none mr-4 ${muted}`} />
                                <select id="currency" value={currency} onChange={e => { const next = e.target.value as Currency; setCurrency(next); setAmount(String(currencies[next].presets[1])); setMessage(""); }} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
                                    {Object.entries(currencies).map(([code, option]) => <option key={code} value={code}>{code} - {option.label}</option>)}
                                </select>
                            </div>
                            <div className="mt-6 flex items-baseline justify-between gap-3"><label htmlFor="amount" className="text-sm font-semibold">Choose an amount</label><span className={`text-xs ${muted}`}>{currency} - one time</span></div>
                            <div className="mt-4 grid grid-cols-3 gap-2">{selectedCurrency.presets.map(value => <button type="button" key={value} onClick={() => setAmount(String(value))} aria-pressed={amount === String(value)} className={`min-h-12 rounded-lg border px-2 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${amount === String(value) ? "border-sky-500 bg-sky-500/10 text-sky-500" : dark ? "border-white/15 hover:border-white/40" : "border-slate-200 hover:border-slate-400"}`}>{selectedCurrency.symbol}{value.toLocaleString("en-IN")}</button>)}</div>
                            <div className={`mt-3 flex items-center rounded-lg border px-4 transition-colors focus-within:border-sky-500 ${field}`}><span className={muted} aria-hidden="true">{selectedCurrency.symbol}</span><input id="amount" type="number" min="1" max="1000000" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} aria-describedby="amount-help" className="w-full min-w-0 bg-transparent px-3 py-4 outline-none" placeholder="Enter an amount" /></div>
                            <p id="amount-help" className={`mt-2 text-xs leading-5 ${muted}`}>Enter any amount from {selectedCurrency.symbol}1 to {selectedCurrency.symbol}1,000,000.</p>
                            <button type="button" onClick={donate} disabled={busy} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-lg bg-sky-500 px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60">{busy ? "Opening checkout..." : "Donate"}</button>
                            <p className={`mt-4 text-center text-xs leading-5 ${muted}`}>One-time payment in {currency}.</p>
                        </div> : <div className="mt-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="w-fit shrink-0 rounded-lg bg-white p-3"><img src="https://patron.colorwall.xyz/assets/crypto/liquid_qr.svg" width="168" height="168" alt="Liquid account QR code" className="h-[168px] w-[168px]" /></div><div><p className="font-mono text-xs uppercase tracking-widest text-sky-500">Liquid Network</p><h3 className="mt-3 font-outfit text-2xl font-medium">Scan to contribute</h3><p className={`mt-3 text-sm leading-6 ${muted}`}>Scan with Aqua, Blockstream Green, Marina or SideSwap. Any amount of L-BTC or USDt is welcome.</p></div></div>
                            <div className={`mt-6 rounded-lg border p-4 ${field}`}><div className="flex items-center justify-between gap-4"><span className={`text-xs font-semibold ${muted}`}>Liquid address</span><button type="button" onClick={copyAddress} className="flex min-h-11 items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy address"}</button></div><p className="mt-2 break-all font-mono text-xs leading-6">{address}</p></div>
                        </div>}
                        {message && <p role="status" className={`mt-4 text-sm leading-6 ${muted}`}>{message}</p>}
                    </section>
                </div>

                <section className={`mt-20 grid gap-4 border-t pt-7 sm:mt-28 sm:grid-cols-[1fr_2fr] sm:gap-10 ${rule}`}>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-500">Looking ahead / 02</p>
                    <div className="max-w-2xl"><h2 className="font-outfit text-3xl font-light tracking-tight sm:text-4xl">Another way to support ColorWall.</h2><p className={`mt-4 text-sm leading-7 sm:text-base ${muted}`}>We plan to offer paid versions on app stores, so you can support the project by purchasing the app when it becomes available.</p></div>
                </section>
            </div>
        </main>
        <Footer theme={theme} />
    </>;
}
