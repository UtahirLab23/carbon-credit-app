import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Alert,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, EnergySavingsLeaf } from '@mui/icons-material';
import { useAuth } from '../features/auth/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(email, password);
    setLoading(false);
    if (!success) {
      setError('Invalid credentials. Try admin@demo.com with any password.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0E1A 0%, #0d1f0d 50%, #0A0E1A 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,80,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <Fade in timeout={600}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            mx: 2,
            bgcolor: 'background.paper',
            border: '1px solid rgba(76,175,80,0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Logo */}
            <Stack alignItems="center" spacing={1.5} mb={4}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(76,175,80,0.4)',
                }}
              >
                <EnergySavingsLeaf sx={{ color: '#fff', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Carbon Credit Exchange
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your dashboard
              </Typography>
            </Stack>

            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

            {/* Demo hint */}
            <Alert
              severity="info"
              sx={{
                mb: 3,
                bgcolor: 'rgba(76,175,80,0.1)',
                border: '1px solid rgba(76,175,80,0.2)',
                color: 'text.secondary',
                fontSize: '0.78rem',
                '& .MuiAlert-icon': { color: 'primary.main' },
              }}
            >
              Demo: use <strong>admin@demo.com</strong> with any password
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  variant="outlined"
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={<Typography variant="body2">Remember me</Typography>}
                  />
                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Forgot password?
                  </Typography>
                </Stack>

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
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(76,175,80,0.45)',
                    },
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
              mt={3}
            >
              © 2026 Carbon Credit Exchange. All rights reserved.
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default LoginPage;
