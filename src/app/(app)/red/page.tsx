import CreditsPageClient from '@/components/credits/CreditsPageClient';
import { mockCreditRecords } from '@/utils/mockData';

export default function RedPage() {
  const records = mockCreditRecords.filter((r) => r.status === 'red');
  return (
    <CreditsPageClient
      records={records}
      statusColor="#EF5350"
      statusLabel="Operations In Progress"
      title="Red Credits"
      subtitle="Wells currently in active operations phase"
      iconName="Construction"
    />
  );
}
