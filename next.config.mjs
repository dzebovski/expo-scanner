import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          path.join(__dirname, '.next'),
          path.join(__dirname, '.cursor'),
          path.join(__dirname, '.git'),
        ],
        poll: 2000,
      };
    }
    return config;
  },
};

export default nextConfig;
