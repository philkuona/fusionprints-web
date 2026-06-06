import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first (≈20-30% smaller than WebP), fall back to WebP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        // Customer photo library — uploaded to Backblaze B2, served from
        // <bucket>.s3.<region>.backblazeb2.com. `**` matches the bucket +
        // region subdomains at the start of the host.
        protocol: "https",
        hostname: "**.backblazeb2.com",
        pathname: "/**",
      },
      {
        // Google profile pictures for users who signed in with Google.
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
