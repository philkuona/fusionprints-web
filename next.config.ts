import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Customer photo library — uploaded to Backblaze B2, served from
        // <bucket>.s3.<region>.backblazeb2.com. `**` matches the bucket +
        // region subdomains at the start of the host.
        protocol: "https",
        hostname: "**.backblazeb2.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
