import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, ArrowLeft, BadgeCheck, Link2, Sparkles } from "lucide-react";
import { getCreatorByHandle, validateHandle } from "@/lib/creators";

export const dynamic = "force-dynamic";

// dynamic vanity route serving colorwall.xyz/@handle creator reservations
export default async function CreatorHandlePage({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle: rawParam } = await params;
    const decoded = decodeURIComponent(rawParam);

    // only match paths prefixed with @ so regular unknown routes still return 404
    if (!decoded.startsWith("@")) {
        notFound();
    }

    const clean = decoded.slice(1);
    const validation = validateHandle(clean);
    const creator = validation.valid ? await getCreatorByHandle(validation.handle) : null;

    return (
        <main className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center px-4 py-32">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
                <Link
                    href="/creators"
                    className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Creators</span>
                </Link>

                {creator ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a4ff]/15 text-[#00a4ff] border border-[#00a4ff]/30 font-mono text-[11px]">
                                <Sparkles className="w-3 h-3" />
                                Reserved Handle
                            </span>
                            <span className="font-mono text-xs text-white/40">{creator.creatorId}</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-outfit text-4xl font-light tracking-tight">
                                    @{creator.handle}
                                </h1>
                                {creator.verified && (
                                    <BadgeCheck className="w-6 h-6 text-[#00a4ff]" />
                                )}
                            </div>
                            <p className="text-sm text-white/60 mt-1">
                                {creator.displayName} · {creator.specialty}
                            </p>
                        </div>

                        <p className="text-sm text-white/55 font-light leading-relaxed">
                            This creator portfolio handle is reserved for the upcoming ColorWall Marketplace launch.
                        </p>

                        <a
                            href={creator.deepLinkUrl}
                            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#00a4ff] hover:bg-[#0090e0] text-white text-xs font-medium transition-colors"
                        >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Open in ColorWall App</span>
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#00a4ff]">
                            <AtSign className="w-5 h-5" />
                        </div>
                        <h1 className="font-outfit text-3xl sm:text-4xl font-light tracking-tight">
                            @{clean.toLowerCase()} is unclaimed
                        </h1>
                        <p className="text-sm text-white/60 font-light leading-relaxed">
                            {validation.valid
                                ? "Nobody has reserved this vanity handle yet. Claim it now before the Creator Marketplace opens."
                                : validation.reason || "This handle is not eligible for reservation."}
                        </p>
                        {validation.valid && (
                            <Link
                                href={`/creators?handle=${encodeURIComponent(validation.handle)}`}
                                className="inline-flex items-center justify-center py-3 px-6 rounded-full bg-[#00a4ff] hover:bg-[#0090e0] text-white text-xs font-medium transition-colors w-fit"
                            >
                                Claim @{validation.handle}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
