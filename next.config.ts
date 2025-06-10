import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    // Suppress warnings for known Supabase realtime dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
      { message: /Critical dependency: the request of a dependency is an expression/ }
    ];
    return config;
  },
};

export default nextConfig;
