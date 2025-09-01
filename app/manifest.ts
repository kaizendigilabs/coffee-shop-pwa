import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coffee Shop PWA",
    short_name: "CoffeePWA",
    description: "A PWA for your favorite coffee shop.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B4513",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
