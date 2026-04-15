// @ts-nocheck
'use client';
import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountCircle,
  CheckCircle,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ pt: 4 }}
    >
      {value === index && children}
    </Box>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ currentUser }: { currentUser: import('@/types').User }) {
  const [name, setName]       = useState(currentUser.name);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const isDirty = name.trim() !== currentUser.name;

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { name: name.trim(), full_name: name.trim() },
      });
      if (updateErr) throw updateErr;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={4}>
      {/* Avatar block */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: 'primary.dark',
            fontSize: '1.75rem',
            fontWeight: 700,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {currentUser.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {currentUser.email}
          </Typography>
          <Chip
            label={currentUser.role}
            size="small"
            sx={{
              mt: 0.75,
              bgcolor: 'rgba(76,175,80,0.12)',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.7rem',
              border: '1px solid rgba(76,175,80,0.25)',
            }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Name field */}
      <Box sx={{ maxWidth: 480 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Display Name
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          This is how your name appears across the platform.
        </Typography>
        <TextField
          fullWidth
          label="Full Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); setSuccess(false); }}
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Read-only fields */}
      <Box sx={{ maxWidth: 480 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Email Address
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Contact your administrator to change your email address.
        </Typography>
        <TextField
          fullWidth
          label="Email"
          value={currentUser.email}
          disabled
          sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(255,255,255,0.4)' } }}
        />
      </Box>

      {/* Account info row */}
      <Box
        sx={{
          maxWidth: 480,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
            Account Type
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentUser.userType}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
            Member Since
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentUser.joinedDate}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
            Status
          </Typography>
          <Chip
            label={currentUser.status}
            size="small"
            sx={{
              bgcolor: currentUser.status === 'Active' ? 'rgba(37,196,106,0.15)' : 'rgba(128,128,128,0.12)',
              color:   currentUser.status === 'Active' ? '#25C46A' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: `1px solid ${currentUser.status === 'Active' ? 'rgba(37,196,106,0.3)' : 'rgba(128,128,128,0.2)'}`,
            }}
          />
        </Box>
      </Box>

      {/* Save button */}
      <Box sx={{ maxWidth: 480 }}>
        {success && (
          <Alert
            icon={<CheckCircle fontSize="small" />}
            severity="success"
            sx={{ mb: 2, bgcolor: 'rgba(37,196,106,0.1)', border: '1px solid rgba(37,196,106,0.25)', color: '#25C46A' }}
          >
            Name updated successfully.
          </Alert>
        )}
        <Button
          variant="contained"
          size="large"
          disabled={!isDirty || saving}
          onClick={handleSave}
          sx={{
            fontWeight: 700,
            px: 4,
            bgcolor: isDirty ? 'primary.main' : undefined,
            minWidth: 160,
          }}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>
    </Stack>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [current,    setCurrent]    = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');

  const strength = (() => {
    if (!newPw) return 0;
    let score = 0;
    if (newPw.length >= 8)               score++;
    if (/[A-Z]/.test(newPw))             score++;
    if (/[0-9]/.test(newPw))             score++;
    if (/[^A-Za-z0-9]/.test(newPw))      score++;
    return score; // 0–4
  })();

  const strengthLabel  = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor  = ['', '#EF5350', '#FFA726', '#29B6F6', '#25C46A'][strength];

  const handleSave = async () => {
    setError('');
    if (!current)                              { setError('Please enter your current password.'); return; }
    if (newPw.length < 8)                      { setError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirm)                     { setError('Passwords do not match.'); return; }
    if (newPw === current)                     { setError('New password must be different from current.'); return; }

    setSaving(true);
    try {
      const supabase = createClient();

      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Unable to verify session.');

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      });
      if (signInErr) throw new Error('Current password is incorrect.');

      // Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) throw updateErr;

      setSuccess(true);
      setCurrent(''); setNewPw(''); setConfirm('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={4} sx={{ maxWidth: 480 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Change Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a strong password you don&apos;t use elsewhere. Minimum 8 characters.
        </Typography>
      </Box>

      {/* Current password */}
      <TextField
        fullWidth
        label="Current Password"
        type={showCur ? 'text' : 'password'}
        value={current}
        onChange={(e) => { setCurrent(e.target.value); setError(''); setSuccess(false); }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowCur((v) => !v)} edge="end">
                  {showCur ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* New password */}
      <Box>
        <TextField
          fullWidth
          label="New Password"
          type={showNew ? 'text' : 'password'}
          value={newPw}
          onChange={(e) => { setNewPw(e.target.value); setError(''); setSuccess(false); }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowNew((v) => !v)} edge="end">
                    {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {/* Strength meter */}
        {newPw.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', gap: '4px', mb: 0.75 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: i <= strength ? strengthColor : 'rgba(128,128,128,0.15)',
                    transition: 'background-color 0.3s',
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: strengthColor, fontWeight: 600 }}>
              {strengthLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {strength < 2 && 'Add uppercase, numbers, or symbols.'}
              {strength === 2 && 'Getting better — add more variety.'}
              {strength >= 3 && 'Great password choice!'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Confirm password */}
      <TextField
        fullWidth
        label="Confirm New Password"
        type={showConf ? 'text' : 'password'}
        value={confirm}
        onChange={(e) => { setConfirm(e.target.value); setError(''); setSuccess(false); }}
        error={!!confirm && confirm !== newPw}
        helperText={!!confirm && confirm !== newPw ? 'Passwords do not match' : ''}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowConf((v) => !v)} edge="end">
                  {showConf ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Requirements checklist */}
      {newPw.length > 0 && (
        <Box
          sx={{
            bgcolor: 'rgba(128,128,128,0.05)',
            border: '1px solid rgba(128,128,128,0.12)',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.5, color: 'text.secondary' }}>
            Password Requirements
          </Typography>
          {[
            { label: 'At least 8 characters',       met: newPw.length >= 8 },
            { label: 'One uppercase letter (A-Z)',   met: /[A-Z]/.test(newPw) },
            { label: 'One number (0-9)',             met: /[0-9]/.test(newPw) },
            { label: 'One special character (!@#…)', met: /[^A-Za-z0-9]/.test(newPw) },
          ].map(({ label, met }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Box
                sx={{
                  width: 16, height: 16, borderRadius: '50%',
                  bgcolor: met ? 'rgba(37,196,106,0.2)' : 'rgba(128,128,128,0.1)',
                  border: `1px solid ${met ? 'rgba(37,196,106,0.5)' : 'rgba(128,128,128,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 10,
                }}
              >
                {met && <CheckCircle sx={{ fontSize: 10, color: '#25C46A' }} />}
              </Box>
              <Typography variant="caption" sx={{ color: met ? '#25C46A' : 'text.secondary', fontWeight: met ? 600 : 400 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Error / Success */}
      {error && (
        <Alert severity="error" sx={{ bgcolor: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.3)' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          icon={<CheckCircle fontSize="small" />}
          severity="success"
          sx={{ bgcolor: 'rgba(37,196,106,0.1)', border: '1px solid rgba(37,196,106,0.25)', color: '#25C46A' }}
        >
          Password changed successfully.
        </Alert>
      )}

      {/* Submit */}
      <Button
        variant="contained"
        size="large"
        onClick={handleSave}
        disabled={!current || !newPw || !confirm || saving}
        sx={{ fontWeight: 700, px: 4, minWidth: 180 }}
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Lock fontSize="small" />}
      >
        {saving ? 'Updating…' : 'Update Password'}
      </Button>
    </Stack>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsClient() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page header */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} color="text.primary">
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your account preferences and security.
        </Typography>
      </Box>

      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Tab bar */}
          <Box
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: { xs: 2, md: 4 },
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  minHeight: 52,
                  gap: 1,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab
                icon={<AccountCircle sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Profile"
              />
              <Tab
                icon={<Lock sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Security"
              />
            </Tabs>
          </Box>

          {/* Tab content */}
          <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
            <TabPanel value={tab} index={0}>
              <ProfileTab currentUser={currentUser} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <SecurityTab />
            </TabPanel>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnack('')} severity="success" sx={{ bgcolor: '#1B5E20', color: '#fff' }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
