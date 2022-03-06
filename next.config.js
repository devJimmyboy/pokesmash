/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com", "play.pokemonshowdown.com"],
  },
}

module.exports = nextConfig
