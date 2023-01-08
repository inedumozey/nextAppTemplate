/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
