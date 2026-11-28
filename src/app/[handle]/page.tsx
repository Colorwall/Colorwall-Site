import { notFound } from "next/navigation";
import { getCreatorByHandle, validateHandle } from "@/lib/creators";
import { CreatorHandleClient } from "@/app/components/creators/CreatorHandleClient";

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
        <CreatorHandleClient
            creator={creator}
            cleanHandle={clean}
            isValid={validation.valid}
            validationReason={validation.reason}
        />
    );
}
