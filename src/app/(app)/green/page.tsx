import CreditsPageClient from '@/components/credits/CreditsPageClient';
import { mockCreditRecords } from '@/utils/mockData';

export default function GreenPage() {
  const records = mockCreditRecords.filter((r) => r.status === 'green');
  return (
    <CreditsPageClient
      records={records}
      statusColor="#66BB6A"
      statusLabel="Credits Issued"
      title="Green Credits"
      subtitle="Wells with fully issued and tradeable credits"
      iconName="AccountBalanceWallet"
    />
  );
}
