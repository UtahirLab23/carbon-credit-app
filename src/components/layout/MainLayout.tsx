// @ts-nocheck
'use client';
import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ChevronLeft,
  Dashboard as DashboardIcon,
  EnergySavingsLeaf,
  FiberManualRecord,
  LightMode,
  DarkMode,
  Logout,
  Menu as MenuIcon,
  NavigateNext,
  People,
  Settings,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useColorMode } from '@/components/providers/MuiThemeProvider';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  dot?: string;
  requiredRole?: Array<'Admin' | 'Manager' | 'Viewer'>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',               path: '/dashboard', icon: <DashboardIcon />,                                   color: '#4CAF50' },
  { label: 'Operations In Progress',  path: '/red',       icon: <FiberManualRecord sx={{ color: '#EF5350' }} />,    color: '#EF5350', dot: '#EF5350' },
  { label: 'Credit Certification',    path: '/yellow',    icon: <FiberManualRecord sx={{ color: '#FFA726' }} />,    color: '#FFA726', dot: '#FFA726' },
  { label: 'Credits Issued',          path: '/green',     icon: <FiberManualRecord sx={{ color: '#66BB6A' }} />,    color: '#66BB6A', dot: '#66BB6A' },
  { label: 'User Management',         path: '/users',     icon: <People />,                                          color: '#90CAF9', requiredRole: ['Admin', 'Manager'] },
];

const breadcrumbMap: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/red':       ['Dashboard', 'Operations In Progress'],
  '/yellow':    ['Dashboard', 'Credit Certification'],
  '/green':     ['Dashboard', 'Credits Issued'],
  '/users':     ['Dashboard', 'User Management'],
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Client-side auth guard — redirect to /login if no session.
  // We wait up to 2s for AuthProvider to resolve the session before redirecting,
  // to avoid a flash redirect on first load.
  React.useEffect(() => {
    const timer = setTimeout(() => setAuthChecked(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (authChecked && !currentUser) {
      router.replace('/login');
    }
  }, [authChecked, currentUser, router]);

  const handleLogout = () => {
    logout();
  };

  const crumbs = breadcrumbMap[pathname] ?? ['Dashboard'];

  const visibleNav = navItems.filter((item) => {
    if (!item.requiredRole) return true;
    return currentUser?.role && item.requiredRole.includes(currentUser.role as 'Admin' | 'Manager' | 'Viewer');
  });

  const sidebarBg   = mode === 'dark' ? '#0D1117' : '#FFFFFF';
  const sidebarBorder = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <EnergySavingsLeaf sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>CarbonCredit</Typography>
            <Typography variant="caption" color="text.secondary">Exchange Platform</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: sidebarBorder, mx: 2 }} />

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {visibleNav.map((item) => {
          const active = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { router.push(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: '10px', mb: 0.5, px: 2, py: 1.2,
                bgcolor: active ? 'rgba(76,175,80,0.12)' : 'transparent',
                border: active ? '1px solid rgba(76,175,80,0.2)' : '1px solid transparent',
                '&:hover': { bgcolor: active ? 'rgba(76,175,80,0.15)' : 'rgba(128,128,128,0.06)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? item.color : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    style: {
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'inherit' : undefined,
                    },
                  },
                }}
              />
              {item.dot && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.dot, flexShrink: 0 }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: sidebarBorder, mx: 2 }} />

      {/* Bottom user strip */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.dark', fontSize: '0.85rem', fontWeight: 700 }}>
            {currentUser?.name?.charAt(0) ?? ''}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {currentUser ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{currentUser.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{currentUser.role}</Typography>
              </>
            ) : (
              <>
                <Skeleton variant="text" width={100} height={16} />
                <Skeleton variant="text" width={60} height={13} />
              </>
            )}
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop permanent drawer */}
      <Drawer variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: sidebarBg, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setMobileOpen(false)} size="small"><ChevronLeft /></IconButton>
        </Box>
        {drawerContent}
      </Drawer>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Sticky top header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: mode === 'dark' ? 'rgba(13,17,23,0.9)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${sidebarBorder}`,
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 60 } }}>
            {/* Hamburger – mobile only */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Breadcrumbs */}
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" sx={{ color: 'text.secondary' }} />}
              sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}
            >
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return isLast ? (
                  <Typography key={crumb} variant="body2" sx={{ fontWeight: 600 }} color="text.primary">
                    {crumb}
                  </Typography>
                ) : (
                  <Link key={crumb} component={NextLink} href="/dashboard" underline="hover"
                    sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {crumb}
                  </Link>
                );
              })}
            </Breadcrumbs>

            {/* Mobile title */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: { sm: 'none' }, flex: 1 }}>
              {crumbs[crumbs.length - 1]}
            </Typography>

            {/* Right actions */}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                <IconButton size="small" onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>
              </Tooltip>

              {currentUser ? (
                <Chip
                  label={currentUser.role}
                  size="small"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    bgcolor: 'rgba(76,175,80,0.12)',
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    border: '1px solid rgba(76,175,80,0.25)',
                  }}
                />
              ) : (
                <Skeleton variant="rounded" width={52} height={22} sx={{ display: { xs: 'none', sm: 'block' } }} />
              )}

              <Tooltip title="Account">
                <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.8rem', fontWeight: 700 }}>
                    {currentUser?.name?.charAt(0) ?? ''}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Profile dropdown menu */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            {currentUser ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{currentUser.name}</Typography>
                <Typography variant="caption" color="text.secondary">{currentUser.email}</Typography>
              </>
            ) : (
              <>
                <Skeleton variant="text" width={120} height={18} />
                <Skeleton variant="text" width={160} height={14} />
              </>
            )}
          </Box>
          <Divider />
          <MenuItem onClick={() => { setProfileAnchor(null); }} sx={{ gap: 1.5, fontSize: '0.875rem' }}>
            <Settings fontSize="small" /> Settings
          </MenuItem>
          <MenuItem onClick={() => { setProfileAnchor(null); handleLogout(); }} sx={{ gap: 1.5, fontSize: '0.875rem', color: 'error.main' }}>
            <Logout fontSize="small" /> Logout
          </MenuItem>
        </Menu>

        {/* Page content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
