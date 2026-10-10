export type FluidSlide = {
  id: string;
  index: string;
  tag: string;
  title: string;
  description: string;
  video: string;
  poster: string;
};

// fluid gallery slides configuration linked to verified webm assets in public/videos
export const FLUID_SLIDES: FluidSlide[] = [
  {
    id: "colorwall-intro",
    index: "#000",
    tag: "THE ENGINE",
    title: "Colorwall",
    description:
      "The newest desktop customization app for Windows. A blazing-fast Desktop Customization Engine built in Rust.",
    video: "/videos/initals.webm",
    poster: "/videos/posters/initals.webp",
  },
  {
    id: "panda-performance",
    index: "#001",
    tag: "PERFORMANCE",
    title: "Zero-Compromise",
    description:
      "Built entirely in Rust & Tauri with a native Direct3D11 compositor. Near-zero CPU overhead, even at native 4K.",
    video: "/videos/Uncle_Panda_Remnant_Tale.webm",
    poster: "/videos/posters/Uncle_Panda_Remnant_Tale.webp",
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
    id: "astronaut",
    index: "#004",
    tag: "ATMOSPHERE",
    title: "Cinematic Depth",
    description:
      "Immersive visual depth with shaders and scenes running effortlessly at high framerates.",
    video: "/videos/Sci-Fi_Astronaut_at_Rainy_Bus_Stop.webm",
    poster: "/videos/posters/Sci-Fi_Astronaut_at_Rainy_Bus_Stop.webp",
  },
  {
    id: "windmills",
    index: "#005",
    tag: "LANDSCAPES",
    title: "Living Horizons",
    description:
      "Expansive high-framerate environments that bring your monitor to life with subtle atmospheric motion.",
    video: "/videos/Windmills_Battlefield_1_Dawn_of_War_Live_Wallpaper.webm",
    poster: "/videos/posters/Windmills_Battlefield_1_Dawn_of_War_Live_Wallpaper.webp",
  },
  {
    id: "nte",
    index: "#006",
    tag: "CUSTOMIZATION",
    title: "Deep Control",
    description:
      "Style your taskbar with acrylic blurs, control multi-monitor setups, and tweak renderer presets to perfection.",
    video: "/videos/initialstwo.webm",
    poster: "/videos/posters/initialstwo.webp",
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
    id: "velocity",
    index: "#008",
    tag: "AUTOMOTIVE",
    title: "Pure Velocity",
    description:
      "High-octane wallpapers rendered in crisp detail. Speed, aggressive aesthetics, and precision directly on your desktop.",
    video: "/videos/GTRRARI.webm",
    poster: "/videos/posters/GTRRARI.webp",
  },
];

export const FLUID_VIDEO_URLS = FLUID_SLIDES.map((s) => s.video);
