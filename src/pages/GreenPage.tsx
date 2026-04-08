import React from 'react';
import { AccountBalanceWallet } from '@mui/icons-material';
import CreditsTable from '../components/CreditsTable';
import { mockCreditRecords } from '../utils/mockData';
import { useAuth } from '../features/auth/AuthContext';
import { useProjects, useWells } from '../hooks/useInvestorApi';
import { wellToRecord } from '../utils/apiMappers';

const GreenPage: React.FC = () => {
  const { apiCredentials } = useAuth();
  const { data: projects } = useProjects();
  const firstProjectId = projects?.[0]?.id ?? null;
  const { data: wells, loading } = useWells(firstProjectId);

  const records = apiCredentials && wells
    ? wells.map(wellToRecord).filter((r) => r.status === 'green')
    : mockCreditRecords.filter((r) => r.status === 'green');

  return (
    <CreditsTable
      records={records}
      statusColor="#66BB6A"
      statusLabel="Green"
      title="Credits Issued"
      subtitle="Credits fully issued, tokenized, and held in the High Intensity Vault."
      icon={<AccountBalanceWallet />}
      loading={loading}
    />
  );
};

export default GreenPage;
