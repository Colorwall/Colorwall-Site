import type { Metadata } from "next";
import DonateClient from "./DonateClient";

export const metadata: Metadata = {
    title: "Donate",
    description: "Support ColorWall and help us keep desktop customization free for everyone.",
    alternates: { canonical: "https://www.colorwall.xyz/donate" },
};

export default function DonatePage() { return <DonateClient />; }
