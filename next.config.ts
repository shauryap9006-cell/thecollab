import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);
// Vercel deploys to root domain (''). GitHub Pages needs '/thecollab'.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isVercel ? '' : (process.env.GITHUB_ACTIONS ? '/thecollab' : ''));

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Typechecking stays ON — the build must pass clean.
    ignoreBuildErrors: false,
  },
  output: 'export',
  // Ship browser source maps so the deployed bundles are debuggable (A4).
  productionBrowserSourceMaps: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  transpilePackages: ['three', 'gsap', '@react-three/drei'],
};

export default nextConfig;
