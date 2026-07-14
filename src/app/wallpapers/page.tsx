import { getIndex } from "@/lib/wallpapers";
import WallpaperClient from "./WallpaperClient";

export default function WallpapersPage() {
    const idx = getIndex();

    // if the index hasn't been built yet or is empty, fallback gracefully
    if (!idx || idx.entries.length === 0) {
        return <WallpaperClient initialItems={[]} initialTotal={0} />;
    }

    // grab the first 20 items directly from memory
    const initialItems = idx.entries.slice(0, 20);
    const initialTotal = idx.entries.length;

    // pass them directly to the client to eliminate the loading skeleton
    return <WallpaperClient initialItems={initialItems} initialTotal={initialTotal} />;
}
