'use client';
import CreditsPageClient from '@/components/credits/CreditsPageClient';
import { useCreditsData } from '@/hooks/useCreditsData';

export default function YellowPage() {
  const { yellow, loading, error } = useCreditsData();
  return (
    <CreditsPageClient
      records={yellow}
      statusColor="#FFA726"
      statusLabel="Credit Certification"
      title="Yellow Credits"
      subtitle="Wells in the credit certification process"
      iconName="Verified"
      loading={loading}
      error={error}
    />
  );
}
