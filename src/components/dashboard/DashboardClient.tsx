// @ts-nocheck
'use client';
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
import { mockDashboardStats, mockCreditRecords } from '@/utils/mockData';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProjects, useWells, useLatestUpdate } from '@/components/hooks/useInvestorApi';
import { wellToRecord } from '@/utils/apiMappers';

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
  : n.toString();

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const CARD_META = [
  { label: 'Active Wells',  icon: <WaterDrop />,      solidBg: '#E8762B', textColor: '#FFFFFF' },
  { label: 'Total Credits', icon: <Bolt />,            solidBg: '#00B4D8', textColor: '#FFFFFF' },
  { label: 'Mkt Value',     icon: <MonetizationOn />,  solidBg: '#F9F002', textColor: '#111111' },
  { label: 'Projected',     icon: <TrendingUp />,      solidBg: '#25C46A', textColor: '#FFFFFF' },
];

const DashboardClient: React.FC = () => {
  const { currentUser, apiCredentials } = useAuth();

  const { data: projects } = useProjects();
  const firstProjectId = projects?.[0]?.id ?? null;
  const { data: wells, loading: wellsLoading } = useWells(firstProjectId);
  const { data: latestUpdate } = useLatestUpdate(firstProjectId);

  const isLive = Boolean(apiCredentials && wells);
  const liveRecords = wells ? wells.map(wellToRecord) : null;

  const activeWells   = isLive ? (wells?.length ?? 0) : mockDashboardStats.activeWells;
  const totalCredits  = isLive
    ? (latestUpdate?.aggregate_totals?.total_credits ?? liveRecords!.reduce((s, r) => s + r.credits, 0))
    : mockDashboardStats.totalCredits;
  const mktValue      = isLive
    ? (latestUpdate?.aggregate_totals?.total_est_dollar_value ?? liveRecords!.reduce((s, r) => s + r.marketValue, 0))
    : mockDashboardStats.projectedMktValue;
  const projected = mktValue * 1.15;

  const statCards = [
    { ...CARD_META[0], value: activeWells.toString(),   change: isLive ? 'Live well count'        : '+3 this month' },
    { ...CARD_META[1], value: fmt(totalCredits),        change: isLive ? 'Live total credits'     : '+12.4% YoY' },
    { ...CARD_META[2], value: fmtUSD(mktValue),         change: isLive ? 'Live market value'      : '+8.2% this quarter' },
    { ...CARD_META[3], value: fmtUSD(projected),        change: isLive ? '+15% of live mkt value' : '+15% projected growth' },
  ];

  const records = liveRecords ?? mockCreditRecords;
  const redCredits    = records.filter((r) => r.status === 'red').reduce((s, r) => s + r.credits, 0);
  const yellowCredits = records.filter((r) => r.status === 'yellow').reduce((s, r) => s + r.credits, 0);
  const greenCredits  = records.filter((r) => r.status === 'green').reduce((s, r) => s + r.credits, 0);
  const redCount      = isLive ? records.filter((r) => r.status === 'red').length    : mockDashboardStats.redCount;
  const yellowCount   = isLive ? records.filter((r) => r.status === 'yellow').length : mockDashboardStats.yellowCount;
  const greenCount    = isLive ? records.filter((r) => r.status === 'green').length  : mockDashboardStats.greenCount;

  const pipelineStages = [
    { label: 'Operations In Progress', color: '#EF5350', count: redCount,    credits: redCredits,    description: 'Credits associated with field operations currently in progress.' },
    { label: 'Credit Certification',   color: '#FFA726', count: yellowCount, credits: yellowCredits, description: 'Credits undergoing certification, registry processing, or tokenization.' },
    { label: 'Credits Issued',         color: '#66BB6A', count: greenCount,  credits: greenCredits,  description: 'Credits fully issued, tokenized, and held in the High Intensity Vault.' },
  ];

  const recentActivity = records.slice(0, 6);

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ alignItems: 'center' }}>
          <Box flex={1}>
            <Typography variant="h4" sx={{ fontWeight: 700 }} color="text.primary">Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Welcome back, {currentUser?.name?.split(' ')[0]}. Here&apos;s your carbon credit overview.
            </Typography>
          </Box>
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
          {wellsLoading && <Typography variant="caption" color="text.secondary">Loading live data…</Typography>}
        </Stack>
      </Box>

      {/* Stat Cards — 24px gap between cards, flex row with centered icon */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
            <Card sx={{
              bgcolor: card.solidBg,
              border: 'none',
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 28px rgba(0,0,0,0.22)' },
            }}>
              {/* CardContent padding comes from theme override (24px) */}
              <CardContent>
                {/* KPI row: text left, icon right — both vertically centered on same axis */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  {/* Left: label + value + trend — flex column, baseline-aligned */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Typography variant="caption" sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: card.textColor,
                      opacity: 0.85,
                      lineHeight: 1.4,
                    }}>
                      {card.label}
                    </Typography>
                    {/* Value — single line, no overflow */}
                    <Typography variant="h4" sx={{
                      fontWeight: 700,
                      mt: 0.75,
                      color: card.textColor,
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {card.value}
                    </Typography>
                    {/* Trend row — icon + text share a common baseline */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: 1 }}>
                      <TrendingUp sx={{ fontSize: 13, color: card.textColor, opacity: 0.75, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{
                        color: card.textColor,
                        opacity: 0.75,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {card.change}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Right: icon avatar — fixed size, perfectly centered */}
                  <Avatar sx={{
                    bgcolor: 'rgba(255,255,255,0.22)',
                    color: card.textColor,
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    '& svg': { fontSize: 26 },
                  }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Pipeline */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            {/* CardContent padding from theme (24px) */}
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Credit Pipeline</Typography>
              <Stack spacing={3}>
                {pipelineStages.map((stage) => {
                  const pct = totalCredits > 0 ? Math.round((stage.credits / totalCredits) * 100) : 0;
                  return (
                    <Box key={stage.label}>
                      {/* Header row: label left, count + badge right — all on one baseline */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                        {/* Left: dot + label */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <RadioButtonChecked sx={{ color: stage.color, fontSize: 14, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>{stage.label}</Typography>
                        </Box>
                        {/* Right: count text + percentage chip — same height, vertically centered */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
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
                              // fixed height so all badges align to same axis
                              height: 22,
                              minWidth: 42,
                              border: `1px solid ${stage.color}30`,
                              '& .MuiChip-label': { px: '6px', lineHeight: 1 },
                            }}
                          />
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.06)',
                          '& .MuiLinearProgress-bar': { bgcolor: stage.color, borderRadius: 3 },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block', lineHeight: 1.5 }}>
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
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Recent Activity</Typography>
              <Stack spacing={0} divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}>
                {recentActivity.map((record) => {
                  const statusColors: Record<string, string> = { red: '#EF5350', yellow: '#FFA726', green: '#66BB6A' };
                  const statusLabels: Record<string, string> = { red: 'In Progress', yellow: 'Certification', green: 'Issued' };
                  return (
                    <Box
                      key={record.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        // 12px vertical padding → consistent row height
                        py: 1.5,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                      }}
                    >
                      {/* Left: dot + text */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box sx={{
                          width: 8, height: 8,
                          borderRadius: '50%',
                          bgcolor: statusColors[record.status],
                          flexShrink: 0,
                          // nudge dot to optical center of the text block
                          mt: '1px',
                        }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>{record.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {record.field} · Updated {record.lastUpdated}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Right: value + badge — both right-aligned on the same vertical axis */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                          {record.credits.toLocaleString()} credits
                        </Typography>
                        <Chip
                          label={statusLabels[record.status]}
                          size="small"
                          sx={{
                            bgcolor: `${statusColors[record.status]}18`,
                            color: statusColors[record.status],
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            // same fixed height as pipeline chips → unified badge system
                            height: 22,
                            border: `1px solid ${statusColors[record.status]}30`,
                            '& .MuiChip-label': { px: '6px', lineHeight: 1 },
                          }}
                        />
                      </Box>
                    </Box>
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

export default DashboardClient;
