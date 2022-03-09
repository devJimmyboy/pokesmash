/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com", "play.pokemonshowdown.com", "cdn.7tv.app"],
  },
}

module.exports = nextConfig
