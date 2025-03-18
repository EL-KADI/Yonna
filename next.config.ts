/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  basePath: "/Yoona",
  assetPrefix: "/Yoona",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
