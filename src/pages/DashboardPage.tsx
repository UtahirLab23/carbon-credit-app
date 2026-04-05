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

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// Exact colours from the design document
// Active Wells → Orange, Total Credits → Cyan, Mkt Value → Yellow, Projected → Green
const statCards = [
  {
    label: 'Active Wells',
    value: mockDashboardStats.activeWells.toString(),
    icon: <WaterDrop />,
    solidBg: '#E8762B',          // orange
    textColor: '#FFFFFF',
    change: '+3 this month',
  },
  {
    label: 'Total Credits',
    value: fmt(mockDashboardStats.totalCredits),
    icon: <Bolt />,
    solidBg: '#00B4D8',          // cyan / sky-blue
    textColor: '#FFFFFF',
    change: '+12.4% YoY',
  },
  {
    label: 'Mkt Value',
    value: fmtUSD(mockDashboardStats.projectedMktValue),
    icon: <MonetizationOn />,
    solidBg: '#F9F002',          // bright yellow
    textColor: '#111111',
    change: '+8.2% this quarter',
  },
  {
    label: 'Projected',
    value: fmtUSD(mockDashboardStats.projectedMktValue * 1.15),
    icon: <TrendingUp />,
    solidBg: '#25C46A',          // green
    textColor: '#FFFFFF',
    change: '+15% projected growth',
  },
];

const pipelineStages = [
  {
    label: 'Operations In Progress',
    color: '#EF5350',
    count: mockDashboardStats.redCount,
    credits: mockCreditRecords.filter((r) => r.status === 'red').reduce((s, r) => s + r.credits, 0),
    description: 'Credits associated with field operations currently in progress.',
    path: '/red',
  },
  {
    label: 'Credit Certification',
    color: '#FFA726',
    count: mockDashboardStats.yellowCount,
    credits: mockCreditRecords.filter((r) => r.status === 'yellow').reduce((s, r) => s + r.credits, 0),
    description: 'Credits undergoing certification, registry processing, or tokenization.',
    path: '/yellow',
  },
  {
    label: 'Credits Issued',
    color: '#66BB6A',
    count: mockDashboardStats.greenCount,
    credits: mockCreditRecords.filter((r) => r.status === 'green').reduce((s, r) => s + r.credits, 0),
    description: 'Credits fully issued, tokenized, and held in the High Intensity Vault.',
    path: '/green',
  },
];

const recentActivity = mockCreditRecords.slice(0, 6);

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Welcome back, {currentUser?.name?.split(' ')[0]}. Here's your carbon credit overview.
        </Typography>
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
                  const totalCredits = mockDashboardStats.totalCredits;
                  const pct = Math.round((stage.credits / totalCredits) * 100);
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
