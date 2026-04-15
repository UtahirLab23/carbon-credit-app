'use client';
import CreditsPageClient from '@/components/credits/CreditsPageClient';
import { useCreditsData } from '@/hooks/useCreditsData';

export default function GreenPage() {
  const { green, loading, error } = useCreditsData();
  return (
    <CreditsPageClient
      records={green}
      statusColor="#66BB6A"
      statusLabel="Credits Issued"
      title="Green Credits"
      subtitle="Wells with fully issued and tradeable credits"
      iconName="AccountBalanceWallet"
      loading={loading}
      error={error}
    />
  );
}
