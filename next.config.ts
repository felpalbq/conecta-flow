import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Local Supabase Auth's site_url is 127.0.0.1 (must match its redirect
  // allow-list exactly), so local dev is accessed via 127.0.0.1 instead of
  // localhost — Next.js blocks cross-origin HMR requests from that host by
  // default, which silently breaks client hydration/event handlers.
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
