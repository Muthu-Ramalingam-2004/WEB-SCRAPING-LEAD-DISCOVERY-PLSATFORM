/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode was intentionally removed: it causes React to double-invoke
  // every useEffect in development, which doubled all API calls (getCurrentUser,
  // getTasks, getLeads) and compounded the Supabase cold-start latency.
};

export default nextConfig;
