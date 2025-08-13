/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  serverExternalPackages: ["mongoose", "@huggingface/transformers"],
  // Configure for browser-only usage of @huggingface/transformers
  webpack: (config, { isServer }) => {
    // This ensures transformers.js only runs on the client
    if (isServer) {
      config.resolve.alias["@huggingface/transformers"] = false;
    }
    return config;
  },
};

export default nextConfig;
