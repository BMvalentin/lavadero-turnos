import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      // Permite subir imágenes de hasta 5 MB (default del framework: 1 MB).
      bodySizeLimit: "5mb",
    },
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '/**', // Permite cualquier hostname HTTPS
      },
      {
        protocol: 'http',
        hostname: '/**', // Permite cualquier hostname HTTP
      },
    ],
    unoptimized: true, // Desactiva optimización para simplificar
  },
};

export default nextConfig;