import type { Metadata } from "next";
import { Suspense } from "react";
import { CreatorsClient } from "@/app/components/creators/CreatorsClient";

export const metadata: Metadata = {
    title: "Creators",
    description: "Reserve your ColorWall @handle, join the verified publisher waitlist, and publish scenes, widgets, and shaders.",
};

// render client shell immediately so navigation is instant without blocking ssr on mongodb
export default function CreatorsPage() {
    return (
        <Suspense fallback={null}>
            <CreatorsClient initialTotal={0} initialRecent={[]} />
        </Suspense>
    );
}
