import type { NextConfig } from "next";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
// Read the installed engine version at build time so NEXT_PUBLIC_GRAPH_VERSION
// is always accurate without manual updates. Resolved through node_modules
// directly because the package's exports map has no ./package.json subpath.
const graphPkg = req(
  "./node_modules/@invariantcontinuum/graph/package.json",
) as { version: string };

// GitHub Pages serves this repo at /<repo-name>. The engine's WASM binaries
// are fetched from public/ under the same prefix, wired via wasmBasePath.
const basePath = "/showcase";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GRAPH_VERSION: graphPkg.version,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  output: "export",
  basePath,
  transpilePackages: ["@invariantcontinuum/graph"],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Enable WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Fix for "Module not found: Can't resolve 'fs'" errors often seen with WASM/Rust
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

export default nextConfig;
