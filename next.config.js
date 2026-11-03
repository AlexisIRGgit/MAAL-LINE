/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // An open tab keeps static pages for 5 minutes by default, which hides homepage updates
    staleTimes: { dynamic: 30, static: 30 },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Product images uploaded from the admin (Vercel Blob)
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig
