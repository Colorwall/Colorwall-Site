import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginWall } from "@/app/components/auth/LoginWall";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your ColorWall account with Google or Discord.",
};

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginWall />
        </Suspense>
    );
}
