/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Unsplash — used for all static demo event images
      { protocol: "https", hostname: "images.unsplash.com" },
      // ImgBB — used for organiser-uploaded event images
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "ibb.co" },
    ],
  },
};

module.exports = nextConfig;
