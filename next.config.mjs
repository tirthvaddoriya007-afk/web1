/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Product images are hotlinked from external CDNs in this demo.
    // Using unoptimized keeps setup simple and avoids remote-pattern config.
    unoptimized: true,
  },
};

export default nextConfig;
