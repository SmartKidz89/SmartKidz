const nextConfig = { 
  experimental: { 
    serverActions: { bodySizeLimit: '2mb' } 
  },
  // Force restart
  reactStrictMode: true,
};
export default nextConfig;