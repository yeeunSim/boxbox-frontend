import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    devIndicators: false,

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
