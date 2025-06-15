/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Skip ESLint errors during production build so that warnings/errors in development do not block deployment.
   * You should still fix the reported issues later.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
