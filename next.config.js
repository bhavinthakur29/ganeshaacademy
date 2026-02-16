/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA: Service worker and manifest handled via public/ and next-pwa or custom SW
  reactStrictMode: true,
  experimental: {
    // Cache RSC payloads in the client-side router cache when navigating between tabs
    staleTimes: {
      dynamic: 60,  // cache dynamic routes (e.g. /attendance, /fees) for 60 seconds
      static: 300,  // cache static routes for 5 minutes
    },
  },
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/favicon.svg", permanent: false },
    ];
  },
};

module.exports = nextConfig;
