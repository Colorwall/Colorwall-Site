import { getIndex, computeToken } from "@/lib/wallpapers";
import WallpaperClient from "./WallpaperClient";

export default function WallpapersPage() {
    const idx = getIndex();

    // if the index hasn't been built yet or is empty, fallback gracefully
    if (!idx || idx.entries.length === 0) {
        return <WallpaperClient initialItems={[]} initialTotal={0} initialNextToken={null} />;
    }

    // grab the first 20 items directly from memory
    const limit = 20;
    const initialItems = idx.entries.slice(0, limit);
    const initialTotal = idx.entries.length;
    
    // generate the next token for page 2 so the client infinite scroll works
    const nextPage = 2;
    const nextMinute = Math.floor(Date.now() / 60000);
    const initialNextToken = limit < initialTotal ? computeToken(nextPage, nextMinute) : null;

    // pass them directly to the client to eliminate the loading skeleton
    return <WallpaperClient initialItems={initialItems} initialTotal={initialTotal} initialNextToken={initialNextToken} />;
}
