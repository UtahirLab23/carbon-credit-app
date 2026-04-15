import MainLayout from '@/components/layout/MainLayout';

// Auth guard is handled by proxy.ts (middleware) — no need to re-check here.
// The proxy already redirects unauthenticated users to /login before this runs.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
