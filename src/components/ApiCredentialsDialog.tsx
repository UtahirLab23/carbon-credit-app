/**
 * ApiCredentialsDialog
 *
 * Lets an authenticated user enter their Blackstone QMS Investor API
 * client_id and client_secret.  Credentials are held in AuthContext
 * (memory only — never written to localStorage or the network).
 */

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ApiCredentialsDialog({ open, onClose }: Props) {
  const { apiCredentials, saveApiCredentials } = useAuth();

  const [clientId, setClientId] = useState(apiCredentials?.clientId ?? '');
  const [clientSecret, setClientSecret] = useState(apiCredentials?.clientSecret ?? '');
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!clientId.trim() || !clientSecret.trim()) return;
    saveApiCredentials({ clientId: clientId.trim(), clientSecret: clientSecret.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setClientId('');
    setClientSecret('');
    saveApiCredentials(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Blackstone QMS — API Credentials
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Credentials are stored in memory only and cleared on logout.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} mt={1}>
          <Alert severity="info" variant="outlined">
            Enter the <strong>client_id</strong> and <strong>client_secret</strong> provided by
            Blackstone. Tokens are automatically refreshed every 30 minutes.
          </Alert>

          <TextField
            label="Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            fullWidth
            autoComplete="off"
            placeholder="e.g. inv_abc123"
          />

          <TextField
            label="Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            fullWidth
            type={showSecret ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••••••••••"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowSecret((v) => !v)} edge="end" size="small">
                    {showSecret ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {saved && (
            <Alert severity="success" variant="filled">
              Credentials saved — live data will now be fetched.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {apiCredentials && (
          <Button color="error" onClick={handleClear} sx={{ mr: 'auto' }}>
            Clear Credentials
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!clientId.trim() || !clientSecret.trim()}
        >
          Save &amp; Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
}
