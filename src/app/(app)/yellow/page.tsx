import CreditsPageClient from '@/components/credits/CreditsPageClient';
import { mockCreditRecords } from '@/utils/mockData';

export default function YellowPage() {
  const records = mockCreditRecords.filter((r) => r.status === 'yellow');
  return (
    <CreditsPageClient
      records={records}
      statusColor="#FFA726"
      statusLabel="Credit Certification"
      title="Yellow Credits"
      subtitle="Wells in the credit certification process"
      iconName="Verified"
    />
  );
}
