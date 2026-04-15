'use client';

// This page must not be statically prerendered — it reads URL hash tokens
// that only exist in the browser at runtime.
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Card, CardContent, CircularProgress,
  IconButton, InputAdornment, Stack, TextField, Typography, Alert,
} from '@mui/material';
import { EnergySavingsLeaf, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

function AcceptInviteInner() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword]           = useState('');
  const [confirm, setConfirm]             = useState('');
  const [showPw, setShowPw]               = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [verifying, setVerifying]         = useState(true);
  const [error, setError]                 = useState('');
  const [done, setDone]                   = useState(false);
  const [inviteeName, setInviteeName]     = useState('');

  // Supabase puts the session tokens in the URL hash on redirect from email link.
  // We need to exchange them for a real session first.
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken  = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type         = hashParams.get('type'); // 'invite' or 'recovery'

    if (!accessToken || !refreshToken || type !== 'invite') {
      setError('This invite link is invalid or has expired. Please ask your admin to resend it.');
      setVerifying(false);
      return;
    }

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error: sessionError }) => {
        if (sessionError || !data.user) {
          setError('Could not verify your invite link. It may have expired.');
        } else {
          const name = data.user.user_metadata?.name as string | undefined;
          if (name) setInviteeName(name);
        }
        setVerifying(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/dashboard'), 2500);
  };

  if (verifying) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0A0E1A' }}>
        <Stack sx={{ alignItems: 'center' }} spacing={2}>
          <CircularProgress color="success" />
          <Typography color="text.secondary">Verifying your invite link…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0E1A 0%, #0d1f0d 50%, #0A0E1A 100%)',
    }}>
      <Card sx={{
        width: '100%', maxWidth: 440, mx: 2,
        bgcolor: 'background.paper',
        border: '1px solid rgba(76,175,80,0.2)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <CardContent sx={{ p: 5 }}>

          {/* Logo */}
          <Stack sx={{ alignItems: 'center', mb: 4 }} spacing={1.5}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '14px',
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(76,175,80,0.4)',
            }}>
              <EnergySavingsLeaf sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Carbon Credit Exchange</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {inviteeName ? `Welcome, ${inviteeName}! ` : ''}Set your password to activate your account.
            </Typography>
          </Stack>

          {/* Success state */}
          {done ? (
            <Stack sx={{ alignItems: 'center', py: 2 }} spacing={2}>
              <CheckCircle sx={{ fontSize: 56, color: '#66BB6A' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Account activated!</Typography>
              <Typography variant="body2" color="text.secondary">Redirecting you to the dashboard…</Typography>
            </Stack>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              )}

              {!error.includes('invalid') && !error.includes('expired') ? (
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="New Password"
                      type={showPw ? 'text' : 'password'}
                      fullWidth
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      helperText="Minimum 8 characters"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPw(v => !v)}>
                                {showPw ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      label="Confirm Password"
                      type={showConfirm ? 'text' : 'password'}
                      fullWidth
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirm(v => !v)}>
                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                        boxShadow: '0 4px 16px rgba(76,175,80,0.3)',
                      }}
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : 'Activate Account'}
                    </Button>
                  </Stack>
                </form>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push('/login')}
                  sx={{ mt: 1 }}
                >
                  Back to Login
                </Button>
              )}
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0A0E1A' }}>
        <CircularProgress color="success" />
      </Box>
    }>
      <AcceptInviteInner />
    </Suspense>
  );
}
