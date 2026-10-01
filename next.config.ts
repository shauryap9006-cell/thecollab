import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Typechecking stays ON — the build must pass clean.
    ignoreBuildErrors: false,
  },
  output: 'export',
  // Only apply basePath and assetPrefix in production (GitHub Pages).
  // NOTE: must match the GitHub Pages repo name — change here if the repo differs.
  basePath: isProd ? '/thecollab' : '',
  assetPrefix: isProd ? '/thecollab' : '',
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  transpilePackages: ['three', 'gsap', '@react-three/drei'],
};

export default nextConfig;
