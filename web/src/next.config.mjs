/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['genkit', '@genkit-ai/google-genai', '@opentelemetry/instrumentation'],
  },
};

export default nextConfig;
