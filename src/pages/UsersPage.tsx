import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
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
  DeleteOutline,
  Email,
  ManageAccounts,
  People,
  PersonAdd,
  Search,
  VisibilityOutlined,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../features/auth/AuthContext';
import type { User } from '../types';

/* ── Zod schema ── */
const inviteSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  role:     z.enum(['Admin', 'Manager', 'Viewer']),
  userType: z.enum(['Default User', 'Future User Lvl 1', 'Future User Lvl 2']),
});
type InviteForm = z.infer<typeof inviteSchema>;

/* ── Helpers ── */
const roleColors: Record<User['role'], string> = { Admin: '#EF5350', Manager: '#FFA726', Viewer: '#4FC3F7' };
const statusColors: Record<User['status'], string> = { Active: '#66BB6A', Pending: '#FFA726', Inactive: '#78909C' };
const roleIcons: Record<User['role'], React.ReactNode> = {
  Admin:   <AdminPanelSettings fontSize="small" />,
  Manager: <ManageAccounts fontSize="small" />,
  Viewer:  <VisibilityOutlined fontSize="small" />,
};

const UsersPage: React.FC = () => {
  const { users, inviteUser, removeUser, can, currentUser } = useAuth();
  const [search,        setSearch]        = useState('');
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null);
  const [snack,         setSnack]         = useState('');
  const [submitting,    setSubmitting]    = useState(false);

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
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      setError('email', { message: 'A user with this email already exists' });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate async
    inviteUser(data.name, data.email, data.role, data.userType);
    setSubmitting(false);
    setInviteOpen(false);
    reset();
    setSnack(`Invitation sent to ${data.email}`);
  };

  const handleDelete = (id: string) => {
    removeUser(id);
    setDeleteTarget(null);
    setSnack('User removed successfully');
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>User Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage platform access, roles, and invite new team members.
          </Typography>
        </Box>
        {can('invite') && (
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setInviteOpen(true)}
            sx={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', boxShadow: '0 4px 16px rgba(76,175,80,0.3)', whiteSpace: 'nowrap' }}>
            Invite User
          </Button>
        )}
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        {statsCards.map((s) => (
          <Card key={s.label} sx={{ flex: 1, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                {s.label}
              </Typography>
              <Typography variant="h5" fontWeight={700} color={s.color} mt={0.5}>{s.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Table */}
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <People sx={{ color: 'text.secondary' }} />
              <Typography variant="h6" fontWeight={600}>All Users</Typography>
            </Stack>
            <TextField size="small" placeholder="Search users…" value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ width: 260 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
            />
          </Stack>

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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <TableRow key={user.id}
                      sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: roleColors[user.role] + '30', color: roleColors[user.role], fontSize: '0.85rem', fontWeight: 700 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
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
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColors[user.status] }} />
                          <Typography variant="caption" color={statusColors[user.status]} fontWeight={600}>{user.status}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{user.joinedDate}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Resend invite">
                          <span>
                            <IconButton size="small" sx={{ color: 'text.secondary', mr: 0.5 }}
                              disabled={user.status !== 'Pending'}>
                              <Email fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {can('delete_user') && !isSelf && (
                          <Tooltip title="Remove user">
                            <IconButton size="small" sx={{ color: '#EF5350' }} onClick={() => setDeleteTarget(user.id)}>
                              <DeleteOutline fontSize="small" />
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

      {/* ── Invite Dialog with react-hook-form + zod ── */}
      <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); reset(); }} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid rgba(76,175,80,0.2)' } }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonAdd sx={{ color: 'primary.main', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>Invite New User</Typography>
                <Typography variant="caption" color="text.secondary">They'll receive an email to join the platform.</Typography>
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
                <TextField {...field} label="Full Name" fullWidth error={!!errors.name}
                  helperText={errors.name?.message} placeholder="e.g. Jane Smith" />
              )} />

              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email}
                  helperText={errors.email?.message} placeholder="e.g. jane@company.com" />
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
                <FormControl fullWidth error={!!errors.userType}>
                  <InputLabel>User Type</InputLabel>
                  <Select {...field} label="User Type">
                    <MenuItem value="Default User">Default User</MenuItem>
                    <MenuItem value="Future User Lvl 1">Future User Lvl 1</MenuItem>
                    <MenuItem value="Future User Lvl 2">Future User Lvl 2</MenuItem>
                  </Select>
                  {errors.userType && <FormHelperText>{errors.userType.message}</FormHelperText>}
                </FormControl>
              )} />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => { setInviteOpen(false); reset(); }} color="inherit" sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} startIcon={<Email />}
              sx={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', boxShadow: '0 4px 12px rgba(76,175,80,0.3)' }}>
              {submitting ? 'Sending…' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid rgba(239,83,80,0.2)' } }}>
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

      {/* Snackbar */}
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack('')} severity="success"
          sx={{ bgcolor: '#1B5E20', color: '#fff', '& .MuiAlert-icon': { color: '#66BB6A' } }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
