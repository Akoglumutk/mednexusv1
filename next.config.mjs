/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Helps with canvas rendering
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows images from Supabase/Google if needed
      },
    ],
  },
};

export default nextConfig;
