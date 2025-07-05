/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['raw.githubusercontent.com', 'play.pokemonshowdown.com', 'cdn.7tv.app'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
