'use client';
import CreditsPageClient from '@/components/credits/CreditsPageClient';
import { useCreditsData } from '@/hooks/useCreditsData';

export default function RedPage() {
  const { red, loading, error } = useCreditsData();
  return (
    <CreditsPageClient
      records={red}
      statusColor="#EF5350"
      statusLabel="Operations In Progress"
      title="Red Credits"
      subtitle="Wells currently in active operations phase"
      iconName="Construction"
      loading={loading}
      error={error}
    />
  );
}
