/** @type {import('next').NextConfig} */
const nextConfig = {
  // We keep the serverActions config we added earlier if it's there.
  serverActions: {
    bodySizeLimit: '10mb',
  },
  
  // --- VVV THIS IS THE FIX VVV ---
  // We are telling Next.js that it is safe to optimize images
  // from our Supabase Storage domain.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gbsaonrilxfwacbhiqlm.supabase.co', // <-- Paste YOUR Supabase hostname here
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // --- END OF FIX ---
};

module.exports = nextConfig;