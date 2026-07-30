import type { MetadataRoute } from "next";

// Web App Manifest — makes the app installable ("Add to Home Screen") on
// Camila's phone with a brand icon, standalone chrome, and brand theme colors.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Heinrich Co. Operations",
    short_name: "HCo Ops",
    description: "Internal operations command center for Heinrich Co.",
    start_url: "/",
    display: "standalone",
    background_color: "#1B1D1E",
    theme_color: "#1B1D1E",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
