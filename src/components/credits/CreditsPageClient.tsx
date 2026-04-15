'use client';

import { Construction, Verified, AccountBalanceWallet } from '@mui/icons-material';
import { Alert, Box, Typography } from '@mui/material';
import CreditsTable from './CreditsTable';
import type { CreditRecord } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  Construction: <Construction />,
  Verified: <Verified />,
  AccountBalanceWallet: <AccountBalanceWallet />,
};

interface Props {
  records: CreditRecord[];
  statusColor: string;
  statusLabel: string;
  title: string;
  subtitle: string;
  iconName: string;
  loading?: boolean;
  error?: string | null;
}

export default function CreditsPageClient({
  records,
  statusColor,
  statusLabel,
  title,
  subtitle,
  iconName,
  loading,
  error,
}: Props) {
  // Hard error — API failed and we have no data to show
  if (error && !loading && records.length === 0) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
        </Box>
        <Alert
          severity="error"
          sx={{ bgcolor: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.3)' }}
        >
          <strong>Unable to load data:</strong> {error}
        </Alert>
      </Box>
    );
  }

  return (
    <CreditsTable
      records={records}
      statusColor={statusColor}
      statusLabel={statusLabel}
      title={title}
      subtitle={`${subtitle} — Live data from Blackstone QMS`}
      icon={iconMap[iconName]}
      loading={loading}
      error={error}
    />
  );
}

