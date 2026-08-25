/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.airtableusercontent.com" },
      { protocol: "https", hostname: "**.airtable.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [{ source: "/buy", destination: "/subsale", permanent: true }];
  },
};

export default nextConfig;
