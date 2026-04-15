// @ts-nocheck
'use client';
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete,
  FileDownload,
  InboxOutlined,
  Search,
  TableRows,
  ViewComfy,
  TrendingUp,
} from '@mui/icons-material';
import type { CreditRecord } from '@/types';
import { StatCardSkeleton, TableSkeleton } from '@/components/Skeletons';

interface CreditsTableProps {
  records: CreditRecord[];
  statusColor: string;
  statusLabel: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

type SortKey = 'name' | 'credits' | 'progress' | 'marketValue';
type SortDir = 'asc' | 'desc';
type Density  = 'compact' | 'comfortable';

const PAGE_SIZES = [5, 10, 25];

const fmtCredits = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
  : n.toFixed(0);

const fmtUSD = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

const CreditsTable: React.FC<CreditsTableProps> = ({
  records,
  statusColor,
  statusLabel,
  title,
  subtitle,
  icon,
  loading = false,
  error = null,
}) => {
  const [search,    setSearch]    = useState('');
  const [sortKey,   setSortKey]   = useState<SortKey>('credits');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(10);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [density,   setDensity]   = useState<Density>('comfortable');
  const [snack,     setSnack]     = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = records
    .filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.field.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return mul * a.name.localeCompare(b.name);
      return mul * (a[sortKey] - b[sortKey]);
    });

  const pageCount  = Math.ceil(filtered.length / pageSize);
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allChecked = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
  const someChecked = !allChecked && paginated.some((r) => selected.has(r.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelected((s) => { const n = new Set(s); paginated.forEach((r) => n.delete(r.id)); return n; });
    } else {
      setSelected((s) => { const n = new Set(s); paginated.forEach((r) => n.add(r.id)); return n; });
    }
  };

  const toggleRow = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });
  };

  const handleBulkDelete = () => {
    setSnack(`${selected.size} record(s) removed`);
    setSelected(new Set());
  };

  const handleExport = () => {
    const rows = (selected.size > 0 ? filtered.filter((r) => selected.has(r.id)) : filtered);
    const csv = ['Name,Field,Credits,Progress,Market Value,Last Updated',
      ...rows.map((r) => `"${r.name}","${r.field}",${r.credits},${r.progress}%,${r.marketValue},${r.lastUpdated}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${statusLabel.toLowerCase()}-credits.csv`; a.click();
    setSnack('Export downloaded');
  };

  const cellPy = density === 'compact' ? 0.75 : 1.5;
  const totals = {
    credits: records.reduce((s, r) => s + r.credits, 0),
    mktVal:  records.reduce((s, r) => s + r.marketValue, 0),
    avgProg: Math.round(records.reduce((s, r) => s + r.progress, 0) / (records.length || 1)),
  };

  if (loading) {
    return (
      <Box>
        <Box mb={4}><Box sx={{ height: 40, width: 300, bgcolor: 'action.hover', borderRadius: 1 }} /></Box>
        <StatCardSkeleton />
        <TableSkeleton rows={5} />
      </Box>
    );
  }

  return (
    <Box>
      {/* API error banner — shown above content so table still displays with mock data */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(255,167,38,0.1)', border: '1px solid rgba(255,167,38,0.3)' }}>
          <strong>API unavailable:</strong> {error}. Showing demo data.
        </Alert>
      )}
      {/* Page header */}
      <Box mb={4}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            bgcolor: `${statusColor}20`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: statusColor,
          }}>
            {icon}
          </Box>
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
              <Chip label={statusLabel} size="small"
                sx={{ bgcolor: `${statusColor}20`, color: statusColor, fontWeight: 700, border: `1px solid ${statusColor}40` }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{subtitle}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Summary cards — 24px gap (spacing={3}), uniform card padding from theme */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Fields',  value: records.length.toString(),       sub: 'active records',  icon: '📋' },
          { label: 'Total Credits', value: fmtCredits(totals.credits), sub: 'carbon credits',  icon: '⚡' },
          { label: 'Avg. Progress', value: `${totals.avgProg}%`,            sub: 'completion rate', icon: '📈' },
          { label: 'Market Value',  value: fmtUSD(totals.mktVal),          sub: 'projected USD',   icon: '💰' },
        ].map((s) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.label}>
            <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${statusColor}18`, height: '100%' }}>
              {/* CardContent padding from theme (24px) */}
              <CardContent>
                <Typography variant="caption" color="text.secondary" sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  lineHeight: 1.4,
                  display: 'block',
                }}>
                  {s.label}
                </Typography>
                {/* Value and sub share a consistent baseline */}
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, mb: 0.25, lineHeight: 1.2 }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                  {s.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main table card — CardContent padding from theme (24px) */}
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent>

          {/* Toolbar: title+count left, actions right — vertically centered */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2.5,
          }}>
            {/* Left */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Records</Typography>
              <Chip
                label={`${filtered.length} total`}
                size="small"
                sx={{ bgcolor: `${statusColor}14`, color: statusColor, fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Box>

            {/* Right: all action controls on the same horizontal axis */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {selected.size > 0 && (
                <>
                  <Chip label={`${selected.size} selected`} size="small" color="primary" />
                  <Tooltip title="Delete selected">
                    <IconButton size="small" color="error" onClick={handleBulkDelete}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Export CSV">
                <IconButton size="small" onClick={handleExport} sx={{ color: 'text.secondary' }}>
                  <FileDownload fontSize="small" />
                </IconButton>
              </Tooltip>

              <ToggleButtonGroup value={density} exclusive size="small"
                onChange={(_, v) => v && setDensity(v as Density)}>
                <Tooltip title="Compact">
                  <ToggleButton value="compact"><TableRows fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title="Comfortable">
                  <ToggleButton value="comfortable"><ViewComfy fontSize="small" /></ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>

              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>Rows</InputLabel>
                <Select value={pageSize} label="Rows"
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  {PAGE_SIZES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                sx={{ width: 200 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>

          <TableContainer>
            <Table size={density === 'compact' ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox indeterminate={someChecked} checked={allChecked} onChange={toggleAll} size="small" color="primary" />
                  </TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>
                    <TableSortLabel active={sortKey === 'name'} direction={sortKey === 'name' ? sortDir : 'asc'}
                      onClick={() => handleSort('name')}>Name / Field</TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel active={sortKey === 'credits'} direction={sortKey === 'credits' ? sortDir : 'desc'}
                      onClick={() => handleSort('credits')}>Credits</TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={sortKey === 'progress'} direction={sortKey === 'progress' ? sortDir : 'desc'}
                      onClick={() => handleSort('progress')}>Progress</TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel active={sortKey === 'marketValue'} direction={sortKey === 'marketValue' ? sortDir : 'desc'}
                      onClick={() => handleSort('marketValue')}>Market $</TableSortLabel>
                  </TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8, border: 0 }}>
                      <Stack sx={{ alignItems: 'center' }} spacing={2}>
                        <InboxOutlined sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.4 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {search ? `No results for "${search}"` : 'No records found'}
                        </Typography>
                        {search && (
                          <Button size="small" onClick={() => setSearch('')}>Clear search</Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((record, idx) => {
                    const globalIdx = (page - 1) * pageSize + idx + 1;
                    const isSelected = selected.has(record.id);
                    return (
                      <TableRow
                        key={record.id}
                        selected={isSelected}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:last-child td': { border: 0 },
                          '&.Mui-selected': { bgcolor: `${statusColor}0A` },
                        }}
                        onClick={() => toggleRow(record.id)}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSelected} onChange={() => toggleRow(record.id)} size="small" color="primary" />
                        </TableCell>
                        <TableCell sx={{ py: cellPy }}>
                          <Typography variant="body2" color="text.secondary">{globalIdx}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: cellPy }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{record.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{record.field}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: cellPy }}>
                          <Stack sx={{ alignItems: 'flex-end' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtCredits(record.credits)}</Typography>
                            <Stack direction="row" spacing={0.3} sx={{ alignItems: 'center' }}>
                              <TrendingUp sx={{ fontSize: 11, color: 'success.main' }} />
                              <Typography variant="caption" color="success.main">credits</Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: cellPy, minWidth: 160 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">{record.progress}%</Typography>
                            <Tooltip title={`${record.progress}% complete`} arrow>
                              <LinearProgress variant="determinate" value={record.progress}
                                sx={{
                                  height: 6, borderRadius: 3,
                                  bgcolor: 'rgba(128,128,128,0.15)',
                                  '& .MuiLinearProgress-bar': { bgcolor: statusColor, borderRadius: 3 },
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ py: cellPy }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtUSD(record.marketValue)}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: cellPy }}>
                          <Typography variant="caption" color="text.secondary">{record.lastUpdated}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pageCount > 1 && (
            <Stack direction="row" sx={{ justifyContent: 'center', mt: 3 }}>
              <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" size="small" />
            </Stack>
          )}
        </CardContent>
      </Card>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack('')} severity="success"
          sx={{ bgcolor: '#1B5E20', color: '#fff', '& .MuiAlert-icon': { color: '#66BB6A' } }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreditsTable;
