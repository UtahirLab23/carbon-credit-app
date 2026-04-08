import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  WaterDrop,
  MonetizationOn,
  Bolt,
  RadioButtonChecked,
  TrendingUp,
} from '@mui/icons-material';
import { mockDashboardStats, mockCreditRecords } from '../utils/mockData';
import { useAuth } from '../features/auth/AuthContext';
import { useProjects, useWells, useLatestUpdate } from '../hooks/useInvestorApi';
import { wellToRecord } from '../utils/apiMappers';

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const CARD_META = [
  { label: 'Active Wells',  icon: <WaterDrop />,      solidBg: '#E8762B', textColor: '#FFFFFF' },
  { label: 'Total Credits', icon: <Bolt />,            solidBg: '#00B4D8', textColor: '#FFFFFF' },
  { label: 'Mkt Value',     icon: <MonetizationOn />,  solidBg: '#F9F002', textColor: '#111111' },
  { label: 'Projected',     icon: <TrendingUp />,      solidBg: '#25C46A', textColor: '#FFFFFF' },
];

const DashboardPage: React.FC = () => {
  const { currentUser, apiCredentials } = useAuth();

  // ── Live API data ────────────────────────────────────────────────────────────
  const { data: projects } = useProjects();
  const firstProjectId = projects?.[0]?.id ?? null;
  const { data: wells, loading: wellsLoading } = useWells(firstProjectId);
  const { data: latestUpdate } = useLatestUpdate(firstProjectId);

  const isLive = Boolean(apiCredentials && wells);

  // ── Computed stats (live or mock) ────────────────────────────────────────────
  const liveRecords = wells ? wells.map(wellToRecord) : null;

  const activeWells   = isLive ? (wells?.length ?? 0) : mockDashboardStats.activeWells;
  const totalCredits  = isLive
    ? (latestUpdate?.aggregate_totals?.total_credits ?? liveRecords!.reduce((s, r) => s + r.credits, 0))
    : mockDashboardStats.totalCredits;
  const mktValue      = isLive
    ? (latestUpdate?.aggregate_totals?.total_est_dollar_value ?? liveRecords!.reduce((s, r) => s + r.marketValue, 0))
    : mockDashboardStats.projectedMktValue;
  const projected     = mktValue * 1.15;

  const statCards = [
    { ...CARD_META[0], value: activeWells.toString(),        change: isLive ? 'Live well count'        : '+3 this month' },
    { ...CARD_META[1], value: fmt(totalCredits),             change: isLive ? 'Live total credits'     : '+12.4% YoY' },
    { ...CARD_META[2], value: fmtUSD(mktValue),              change: isLive ? 'Live market value'      : '+8.2% this quarter' },
    { ...CARD_META[3], value: fmtUSD(projected),             change: isLive ? '+15% of live mkt value' : '+15% projected growth' },
  ];

  // ── Pipeline (live or mock) ──────────────────────────────────────────────────
  const records = liveRecords ?? mockCreditRecords;
  const redCredits    = records.filter((r) => r.status === 'red').reduce((s, r) => s + r.credits, 0);
  const yellowCredits = records.filter((r) => r.status === 'yellow').reduce((s, r) => s + r.credits, 0);
  const greenCredits  = records.filter((r) => r.status === 'green').reduce((s, r) => s + r.credits, 0);
  const redCount      = isLive ? records.filter((r) => r.status === 'red').length    : mockDashboardStats.redCount;
  const yellowCount   = isLive ? records.filter((r) => r.status === 'yellow').length : mockDashboardStats.yellowCount;
  const greenCount    = isLive ? records.filter((r) => r.status === 'green').length  : mockDashboardStats.greenCount;

  const pipelineStages = [
    { label: 'Operations In Progress', color: '#EF5350', count: redCount,    credits: redCredits,    description: 'Credits associated with field operations currently in progress.', path: '/red' },
    { label: 'Credit Certification',   color: '#FFA726', count: yellowCount, credits: yellowCredits, description: 'Credits undergoing certification, registry processing, or tokenization.', path: '/yellow' },
    { label: 'Credits Issued',         color: '#66BB6A', count: greenCount,  credits: greenCredits,  description: 'Credits fully issued, tokenized, and held in the High Intensity Vault.', path: '/green' },
  ];

  const recentActivity = records.slice(0, 6);

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Welcome back, {currentUser?.name?.split(' ')[0]}. Here's your carbon credit overview.
            </Typography>
          </Box>
          {/* Live / Demo data-source indicator */}
          <Chip
            label={isLive ? '● Live Data' : '○ Demo Data'}
            size="small"
            sx={{
              bgcolor: isLive ? 'rgba(37,196,106,0.15)' : 'rgba(255,255,255,0.07)',
              color: isLive ? '#25C46A' : 'text.secondary',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: `1px solid ${isLive ? 'rgba(37,196,106,0.35)' : 'rgba(255,255,255,0.12)'}`,
            }}
          />
          {wellsLoading && (
            <Typography variant="caption" color="text.secondary">Loading live data…</Typography>
          )}
        </Stack>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
            <Card
              sx={{
                bgcolor: card.solidBg,
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', transition: 'transform 0.2s, box-shadow 0.2s' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" fontWeight={700} textTransform="uppercase" letterSpacing="0.08em" sx={{ color: card.textColor, opacity: 0.85 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} mt={0.5} sx={{ color: card.textColor }}>
                      {card.value}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                      <TrendingUp sx={{ fontSize: 14, color: card.textColor, opacity: 0.75 }} />
                      <Typography variant="caption" sx={{ color: card.textColor, opacity: 0.75 }}>
                        {card.change}
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: card.textColor, width: 48, height: 48 }}>
                    {card.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Pipeline stages */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Credit Pipeline
              </Typography>
              <Stack spacing={3}>
                {pipelineStages.map((stage) => {
                  const pct = totalCredits > 0 ? Math.round((stage.credits / totalCredits) * 100) : 0;
                  return (
                    <Box key={stage.label}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <RadioButtonChecked sx={{ color: stage.color, fontSize: 16 }} />
                          <Typography variant="body2" fontWeight={600}>
                            {stage.label}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            {stage.count} fields
                          </Typography>
                          <Chip
                            label={`${pct}%`}
                            size="small"
                            sx={{
                              bgcolor: `${stage.color}20`,
                              color: stage.color,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.06)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: stage.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        {stage.description}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Recent Activity
              </Typography>
              <Stack spacing={0}>
                {recentActivity.map((record, idx) => {
                  const statusColors: Record<string, string> = {
                    red: '#EF5350',
                    yellow: '#FFA726',
                    green: '#66BB6A',
                  };
                  const statusLabels: Record<string, string> = {
                    red: 'In Progress',
                    yellow: 'Certification',
                    green: 'Issued',
                  };
                  return (
                    <React.Fragment key={record.id}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        py={1.5}
                        sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }, px: 1 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: statusColors[record.status],
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {record.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.field} · Updated {record.lastUpdated}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {record.credits.toLocaleString()} credits
                          </Typography>
                          <Chip
                            label={statusLabels[record.status]}
                            size="small"
                            sx={{
                              bgcolor: `${statusColors[record.status]}18`,
                              color: statusColors[record.status],
                              fontSize: '0.7rem',
                              height: 20,
                              fontWeight: 600,
                            }}
                          />
                        </Stack>
                      </Stack>
                      {idx < recentActivity.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
