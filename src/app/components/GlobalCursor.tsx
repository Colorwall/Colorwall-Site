"use client";

import dynamic from "next/dynamic";


const TargetCursor = dynamic(() => import("./landing/TargetCursor"), { ssr: false });

export function GlobalCursor() {
    return <TargetCursor />;
}
