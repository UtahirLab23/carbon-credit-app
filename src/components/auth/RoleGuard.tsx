'use client';
import { Box, Button, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

interface RoleGuardProps {
  allowed: Array<'Admin' | 'Manager' | 'Viewer'>;
  children: React.ReactNode;
}

/**
 * Client-side role guard — renders children only if the current user's role
 * is in the `allowed` list. Otherwise shows an "Access Denied" screen.
 *
 * The middleware already blocks direct URL access server-side.
 * This guard is the client-side safety net for component-level enforcement.
 */
export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { currentUser } = useAuth();
  const router = useRouter();

  // While auth is loading (currentUser not yet set) render nothing —
  // avoids a flash of the denied screen on page load.
  if (currentUser === null) return null;

  if (!allowed.includes(currentUser.role as 'Admin' | 'Manager' | 'Viewer')) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 2, textAlign: 'center',
      }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: '50%',
          bgcolor: 'rgba(239,83,80,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock sx={{ fontSize: 36, color: '#EF5350' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Access Denied</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          You don&apos;t have permission to view this page.
          Contact an Admin if you need access.
        </Typography>
        <Typography variant="caption" sx={{
          px: 1.5, py: 0.5, borderRadius: 1,
          bgcolor: 'rgba(239,83,80,0.1)', color: '#EF5350', fontWeight: 600,
        }}>
          Your role: {currentUser.role}
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ mt: 1 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
