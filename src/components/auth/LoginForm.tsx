'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { signIn } from '@/app/(auth)/login/actions';

export default function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      action={handleSubmit}
      sx={{ width: 380, bgcolor: 'background.paper', borderRadius: 3, p: 4 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Sign in</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField name="email" label="Email" type="email" fullWidth required sx={{ mb: 2 }} />
      <TextField
        name="password"
        label="Password"
        type={showPw ? 'text' : 'password'}
        fullWidth
        required
        sx={{ mb: 3 }}
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
      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
      </Button>
    </Box>
  );
}
