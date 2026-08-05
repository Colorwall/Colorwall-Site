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
    id: "misty-valley",
    index: "#001",
    tag: "live wallpaper",
    title: "Misty Valley",
    description:
      "Fog drifts through a quiet valley under an overcast sky. A seamless 4K loop built for ColorWall — atmospheric, weightless, always in motion.",
    video: "/videos/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webm",
    poster: "/videos/posters/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webp",
  },
  {
    id: "hifumi",
    index: "#002",
    tag: "anime · blue archive",
    title: "Ajitani Hifumi",
    description:
      "A soft train-ride moment rendered as a living desktop. Warm light, quiet motion, and the kind of loop you leave running all day.",
    video: "/videos/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webm",
    poster: "/videos/posters/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webp",
  },
  {
    id: "angel-space",
    index: "#003",
    tag: "anime · space",
    title: "Angel & Astronaut",
    description:
      "Two figures suspended in deep space. Slow drift, soft bloom, and a dreamlike stillness that fills the whole screen.",
    video: "/videos/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webm",
    poster: "/videos/posters/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webp",
  },
  {
    id: "autumn",
    index: "#004",
    tag: "nature · reflection",
    title: "Autumn Leaves",
    description:
      "Fallen leaves and water in quiet conversation. Seasonal color, gentle ripple — a contemplative loop for cooler days.",
    video: "/videos/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webm",
    poster: "/videos/posters/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webp",
  },
  {
    id: "background",
    index: "#005",
    tag: "abstract · ambient",
    title: "Color Field",
    description:
      "A shifting field of tone and light. Minimal subject, maximal atmosphere — the quiet default that still feels alive.",
    video: "/videos/background.webm",
    poster: "/videos/posters/background.webp",
  },
  {
    id: "nte",
    index: "#006",
    tag: "game · cinematic",
    title: "NTE Game",
    description:
      "Game-world light poured into a desktop loop. High contrast, cinematic framing, and motion that rewards a second look.",
    video: "/videos/Download_Nte_Game_Live_Wallpaper_live_wallpaper__4K_HD_.webm",
    poster: "/videos/posters/Download_Nte_Game_Live_Wallpaper_live_wallpaper__4K_HD_.webp",
  },
  {
    id: "laxenta",
    index: "#007",
    tag: "original · vibe",
    title: "Laxenta",
    description:
      "An original ColorWall mood piece. Soft palette, slow breathe, made to sit behind everything else without demanding attention.",
    video: "/videos/laxenta.webm",
    poster: "/videos/posters/laxenta.webp",
  },
  {
    id: "prana",
    index: "#008",
    tag: "glitch · system",
    title: "Prana System Error",
    description:
      "A beautiful failure state. Glitch fragments and system noise remixed into a hypnotic, slightly uneasy living wallpaper.",
    video: "/videos/Prana_System_Error.webm",
    poster: "/videos/posters/Prana_System_Error.webp",
  },
];

export const FLUID_VIDEO_URLS = FLUID_SLIDES.map((s) => s.video);
