// shared client-safe types and handle validation used by both ui and api routes

export interface PublicCreatorProfile {
    creatorId: string;
    handle: string;
    displayName: string;
    source: "App" | "Web";
    verified: boolean;
    profileUrl: string;
    deepLinkUrl: string;
    createdAt: string;
}

const RESERVED_HANDLES = new Set([
    "admin",
    "administrator",
    "api",
    "app",
    "auth",
    "beta",
    "changelog",
    "colorwall",
    "creator",
    "creators",
    "dev",
    "discord",
    "download",
    "downloads",
    "feedback",
    "help",
    "home",
    "laxenta",
    "login",
    "logout",
    "marketplace",
    "mod",
    "moderator",
    "official",
    "patron",
    "privacy",
    "profile",
    "root",
    "settings",
    "shop",
    "signup",
    "store",
    "studio",
    "support",
    "system",
    "terms",
    "wallpapers",
    "www",
]);

export function normalizeHandle(raw: string): string {
    return raw.trim().replace(/^@+/, "").toLowerCase();
}

// validate handle syntax and block reserved platform routes
export function validateHandle(raw: string): { valid: boolean; handle: string; reason?: string } {
    const handle = normalizeHandle(raw);

    if (!handle) {
        return { valid: false, handle, reason: "Enter a handle to check." };
    }
    if (handle.length < 3 || handle.length > 24) {
        return { valid: false, handle, reason: "Handle must be 3 to 24 characters." };
    }
    if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(handle)) {
        return {
            valid: false,
            handle,
            reason: "Use lowercase letters, numbers, _ or - (must start and end with a letter or number).",
        };
    }
    if (RESERVED_HANDLES.has(handle)) {
        return { valid: false, handle, reason: `@${handle} is reserved by ColorWall.` };
    }

    return { valid: true, handle };
}
