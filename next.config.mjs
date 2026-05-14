/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/prism-flags',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
