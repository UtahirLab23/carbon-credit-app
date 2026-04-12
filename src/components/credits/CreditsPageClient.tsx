'use client';

import { Construction, Verified, AccountBalanceWallet } from '@mui/icons-material';
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
}

export default function CreditsPageClient({ records, statusColor, statusLabel, title, subtitle, iconName }: Props) {
  return (
    <CreditsTable
      records={records}
      statusColor={statusColor}
      statusLabel={statusLabel}
      title={title}
      subtitle={subtitle}
      icon={iconMap[iconName]}
    />
  );
}
