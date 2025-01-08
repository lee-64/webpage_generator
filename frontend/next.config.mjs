/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
            source: '/api/:path*',
            destination: process.env.NODE_ENV === 'development'
              ? 'http://127.0.0.1:5001/api/:path*'  // Local development
              : 'https://forgeui.onrender.com/api/:path*'  // Production
            }
        ]
    }
};

export default nextConfig;
