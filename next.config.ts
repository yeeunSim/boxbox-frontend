import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 정적 내보내기 (next build → ./out 생성)
  output: 'export',

  // next/image 사용 시 필수 (이미지 최적화 서버가 없으므로)
  images: { unoptimized: true },

  // 정적 호스팅 호환성 ↑ (경로를 /page/ 형태로 만듦)
  trailingSlash: true,

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/intro',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;