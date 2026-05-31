import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "yadea.com.pk" },
      { protocol: "https", hostname: "okcarhub.com" },
      { protocol: "https", hostname: "www.shinearmor.com" },
      { protocol: "https", hostname: "cdn-blog.zameen.com" },
      { protocol: "https", hostname: "blog.uor.edu.pk" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
