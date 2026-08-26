/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.airtableusercontent.com" },
      { protocol: "https", hostname: "**.airtable.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Airtable already serves these from its own CDN, and Vercel's paid
    // image-optimization quota was getting exhausted resizing them —
    // serve the source URLs directly instead of re-optimizing them.
    unoptimized: true,
  },
  async redirects() {
    return [{ source: "/buy", destination: "/subsale", permanent: true }];
  },
};

export default nextConfig;
