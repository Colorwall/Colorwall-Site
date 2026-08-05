export type FluidSlide = {
  id: string;
  index: string;
  tag: string;
  title: string;
  description: string;
  video: string;
  poster: string;
};

/** First slide = Misty Valley — matches the cinematic landscape reference vibe. */
export const FLUID_SLIDES: FluidSlide[] = [
  {
    id: "colorwall-intro",
    index: "#000",
    tag: "THE ENGINE",
    title: "Colorwall",
    description:
      "Welcome to the desktop customization you deserve. A living workspace filled with interactive canvases.",
    video: "/videos/initals.webm",
    poster: "/videos/posters/initals.webp",
  },
  {
    id: "misty-valley",
    index: "#001",
    tag: "PERFORMANCE",
    title: "Zero-Compromise",
    description:
      "Built entirely in Rust & Tauri with a native Direct3D11 compositor. Near-zero CPU overhead, even at 8K.",
    video: "/videos/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webm",
    poster: "/videos/posters/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webp",
  },
  {
    id: "hifumi",
    index: "#002",
    tag: "STORE",
    title: "Unified Store",
    description:
      "Access thousands of wallpapers from 8+ sources through a single, lightning-fast search bar. Infinite inspiration.",
    video: "/videos/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webm",
    poster: "/videos/posters/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webp",
  },
  {
    id: "angel-space",
    index: "#003",
    tag: "LIBRARY",
    title: "Offline-First",
    description:
      "Your personal collection. Automatic thumbnails, instant previews, and seamless local file integration.",
    video: "/videos/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webm",
    poster: "/videos/posters/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webp",
  },
  {
    id: "autumn",
    index: "#004",
    tag: "STUDIO",
    title: "Node-Based Studio",
    description:
      "Build your own native scenes. Combine video layers, real-time audio-reactive shaders, and particle systems effortlessly.",
    video: "/videos/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webm",
    poster: "/videos/posters/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webp",
  },
  {
    id: "background",
    index: "#005",
    tag: "INTERACTIVE",
    title: "Living Desktop",
    description:
      "Wallpapers that respond to you. Fully interactive HTML5 canvases and WebGL shaders that turn your desktop into a playground.",
    video: "/videos/background.webm",
    poster: "/videos/posters/background.webp",
  },
  {
    id: "nte",
    index: "#006",
    tag: "CUSTOMIZATION",
    title: "Deep Control",
    description:
      "Style your taskbar with acrylic blurs, control multi-monitor setups, and tweak renderer presets to perfection.",
    video: "/videos/Download_Nte_Game_Live_Wallpaper_live_wallpaper__4K_HD_.webm",
    poster: "/videos/posters/Download_Nte_Game_Live_Wallpaper_live_wallpaper__4K_HD_.webp",
  },
  {
    id: "laxenta",
    index: "#007",
    tag: "WIDGETS",
    title: "Modern Widgets",
    description:
      "Pin HTML/JS powered widgets directly to your workspace. Clean, fast, and fully customizable data at a glance.",
    video: "/videos/laxenta.webm",
    poster: "/videos/posters/laxenta.webp",
  },
  {
    id: "prana",
    index: "#008",
    tag: "SOCIAL",
    title: "Discord RPC",
    description:
      "Show off your current scene to your friends. Automatically syncs your active workspace directly to your profile.",
    video: "/videos/Prana_System_Error.webm",
    poster: "/videos/posters/Prana_System_Error.webp",
  },
];

export const FLUID_VIDEO_URLS = FLUID_SLIDES.map((s) => s.video);
