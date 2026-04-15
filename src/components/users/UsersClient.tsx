// @ts-nocheck
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings,
  Close,
  ContentCopy,
  DeleteOutlined,
  Email,
  ManageAccounts,
  People,
  PersonAdd,
  Refresh,
  Search,
  VisibilityOutlined,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/AuthProvider';
import { listUsers, inviteUser as inviteUserAction, deleteUser as deleteUserAction, resendInvite } from '@/app/(app)/users/actions';
import type { User } from '@/types';

const inviteSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  role:     z.enum(['Admin', 'Manager', 'Viewer']),
  userType: z.literal('Default User'),
});
type InviteForm = z.infer<typeof inviteSchema>;

const roleColors: Record<User['role'], string> = { Admin: '#EF5350', Manager: '#FFA726', Viewer: '#4FC3F7' };
const statusColors: Record<User['status'], string> = { Active: '#66BB6A', Pending: '#FFA726', Inactive: '#78909C' };
const roleIcons: Record<User['role'], React.ReactNode> = {
  Admin:   <AdminPanelSettings fontSize="small" />,
  Manager: <ManageAccounts fontSize="small" />,
  Viewer:  <VisibilityOutlined fontSize="small" />,
};

const UsersClient: React.FC = () => {
  const { can, currentUser } = useAuth();

  // ── Real users loaded from Supabase Auth admin API ──────────────────────────
  const [users,        setUsers]        = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError,    setLoadError]    = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setLoadError(null);
    const result = await listUsers();
    setLoadingUsers(false);
    if (!result.success || !result.users) {
      setLoadError(result.error ?? 'Failed to load users');
      return;
    }
    setUsers(result.users);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchUsers(); }, []);
  // ────────────────────────────────────────────────────────────────────────────

  const [search,       setSearch]       = useState('');
  const [inviteOpen,   setInviteOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snack,        setSnack]        = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success'|'error'>('success');
  const [submitting,   setSubmitting]   = useState(false);
  const [inviteLink,   setInviteLink]   = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors }, setError } =
    useForm<InviteForm>({
      resolver: zodResolver(inviteSchema),
      defaultValues: { name: '', email: '', role: 'Viewer', userType: 'Default User' },
    });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (data: InviteForm) => {
    setSubmitting(true);
    const result = await inviteUserAction(data);
    setSubmitting(false);

    if (!result.success) {
      if (result.error?.toLowerCase().includes('email')) {
        setError('email', { message: result.error });
      } else {
        setSnackSeverity('error');
        setSnack(result.error ?? 'Failed to send invitation');
      }
      return;
    }

    setInviteOpen(false);
    reset();
    // Refresh the real user list so the newly invited user appears
    await fetchUsers();

    if (result.inviteLink) {
      setInviteLink(result.inviteLink);
    } else {
      setSnackSeverity('success');
      setSnack(`Invitation email sent to ${data.email}`);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteUserAction(id);
    setDeleteTarget(null);
    if (!result.success) {
      setSnackSeverity('error');
      setSnack(result.error ?? 'Failed to remove user');
    } else {
      // Remove from local state immediately (optimistic), then re-fetch to confirm
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSnackSeverity('success');
      setSnack('User removed successfully');
      // Re-fetch in background to stay in sync
      fetchUsers();
    }
  };

  const handleResend = async (email: string) => {
    const result = await resendInvite(email);
    if (!result.success) {
      setSnackSeverity('error');
      setSnack(result.error ?? 'Failed to resend invite');
    } else {
      setSnackSeverity('success');
      setSnack(`Invite resent to ${email}`);
    }
  };

  const statsCards = [
    { label: 'Total Users', value: users.length,                                        color: '#4FC3F7' },
    { label: 'Active',      value: users.filter((u) => u.status === 'Active').length,   color: '#66BB6A' },
    { label: 'Pending',     value: users.filter((u) => u.status === 'Pending').length,  color: '#FFA726' },
    { label: 'Admins',      value: users.filter((u) => u.role === 'Admin').length,      color: '#EF5350' },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>User Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage platform access, roles, and invite new team members.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh users">
            <IconButton onClick={fetchUsers} disabled={loadingUsers} size="small"
              sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              {loadingUsers ? <CircularProgress size={16} /> : <Refresh fontSize="small" />}
            </IconButton>
          </Tooltip>
          {can('invite') && (
            <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setInviteOpen(true)}
              sx={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', boxShadow: '0 4px 16px rgba(76,175,80,0.3)', whiteSpace: 'nowrap' }}>
              Invite User
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Load error banner */}
      {loadError && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={fetchUsers}>Retry</Button>
        }>{loadError}</Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((s) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.label}>
            <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" sx={{
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  lineHeight: 1.4, display: 'block',
                }}>
                  {s.label}
                </Typography>
                {loadingUsers
                  ? <Skeleton variant="text" width={40} height={48} sx={{ mt: 1 }} />
                  : <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mt: 1, lineHeight: 1.15 }}>{s.value}</Typography>
                }
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table — CardContent padding from theme */}
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent>
          {/* Toolbar: title left, search right — vertically centered */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People sx={{ color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>All Users</Typography>
            </Box>
            <TextField size="small" placeholder="Search users…" value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ width: 260 }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> } }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>User Type</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingUsers ? (
                  // Skeleton rows while fetching real users
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Skeleton variant="circular" width={36} height={36} /><Box><Skeleton width={120} height={14} /><Skeleton width={160} height={12} sx={{ mt: 0.5 }} /></Box></Stack></TableCell>
                      <TableCell><Skeleton width={100} height={14} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                      <TableCell><Skeleton width={60} height={14} /></TableCell>
                      <TableCell><Skeleton width={80} height={14} /></TableCell>
                      <TableCell align="right"><Skeleton variant="circular" width={28} height={28} sx={{ ml: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: roleColors[user.role] + '30', color: roleColors[user.role], fontSize: '0.85rem', fontWeight: 700 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                              {isSelf && <Chip label="You" size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: 'rgba(76,175,80,0.15)', color: 'primary.main' }} />}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{user.userType}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={roleIcons[user.role] as React.ReactElement}
                          label={user.role}
                          size="small"
                          sx={{ bgcolor: roleColors[user.role] + '20', color: roleColors[user.role], border: `1px solid ${roleColors[user.role]}40`, fontWeight: 600, fontSize: '0.75rem', '& .MuiChip-icon': { color: roleColors[user.role] } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColors[user.status] }} />
                          <Typography variant="caption" sx={{ color: statusColors[user.status], fontWeight: 600 }}>{user.status}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{user.joinedDate}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Resend invite">
                          <span>
                            <IconButton size="small" sx={{ color: 'text.secondary', mr: 0.5 }} disabled={user.status !== 'Pending'}
                              onClick={() => handleResend(user.email)}>
                              <Email fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {can('delete_user') && !isSelf && (
                          <Tooltip title="Remove user">
                            <IconButton size="small" sx={{ color: '#EF5350' }} onClick={() => setDeleteTarget(user.id)}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); reset(); }} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', border: '1px solid rgba(76,175,80,0.2)' } } }}>
        <DialogTitle>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonAdd sx={{ color: 'primary.main', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Invite New User</Typography>
                <Typography variant="caption" color="text.secondary">They&apos;ll receive an email to join the platform.</Typography>
              </Box>
            </Stack>
            <IconButton size="small" onClick={() => { setInviteOpen(false); reset(); }} sx={{ color: 'text.secondary' }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} placeholder="e.g. Jane Smith" />
              )} />
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} placeholder="e.g. jane@company.com" />
              )} />
              <Controller name="role" control={control} render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="Admin">Admin – Full access</MenuItem>
                    <MenuItem value="Manager">Manager – Can manage records</MenuItem>
                    <MenuItem value="Viewer">Viewer – Read-only access</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="userType" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  label="User Type"
                  fullWidth
                  disabled
                  value="Default User"
                  helperText="All new users are assigned Default User type"
                  slotProps={{ input: { readOnly: true } }}
                />
              )} />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => { setInviteOpen(false); reset(); }} color="inherit" sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting} startIcon={<Email />}
              sx={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', boxShadow: '0 4px 12px rgba(76,175,80,0.3)' }}>
              {submitting ? 'Sending…' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', border: '1px solid rgba(239,83,80,0.2)' } } }}>
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to remove this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteTarget && handleDelete(deleteTarget)}>Remove</Button>
        </DialogActions>
      </Dialog>

      {/* Copy invite link dialog — shown in local dev when Supabase email is not configured */}
      <Dialog open={!!inviteLink} onClose={() => setInviteLink(null)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', border: '1px solid rgba(76,175,80,0.2)' } } }}>
        <DialogTitle>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Share Invite Link</Typography>
            <IconButton size="small" onClick={() => setInviteLink(null)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Email delivery is not configured. Copy this link and send it directly to the user.
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth size="small" value={inviteLink ?? ''} slotProps={{ input: { readOnly: true } }}
              sx={{ '& input': { fontSize: '0.78rem', fontFamily: 'monospace' } }}
            />
            <Button variant="outlined" startIcon={<ContentCopy />}
              onClick={() => { navigator.clipboard.writeText(inviteLink ?? ''); setSnack('Link copied!'); setInviteLink(null); }}>
              Copy
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack('')} severity={snackSeverity}
          sx={{ bgcolor: snackSeverity === 'success' ? '#1B5E20' : '#7f1d1d', color: '#fff', '& .MuiAlert-icon': { color: snackSeverity === 'success' ? '#66BB6A' : '#EF5350' } }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersClient;
