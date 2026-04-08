import React from 'react';
import { Verified } from '@mui/icons-material';
import CreditsTable from '../components/CreditsTable';
import { mockCreditRecords } from '../utils/mockData';
import { useAuth } from '../features/auth/AuthContext';
import { useProjects, useWells } from '../hooks/useInvestorApi';
import { wellToRecord } from '../utils/apiMappers';

const YellowPage: React.FC = () => {
  const { apiCredentials } = useAuth();
  const { data: projects } = useProjects();
  const firstProjectId = projects?.[0]?.id ?? null;
  const { data: wells, loading } = useWells(firstProjectId);

  const records = apiCredentials && wells
    ? wells.map(wellToRecord).filter((r) => r.status === 'yellow')
    : mockCreditRecords.filter((r) => r.status === 'yellow');

  return (
    <CreditsTable
      records={records}
      statusColor="#FFA726"
      statusLabel="Yellow"
      title="Credit Certification"
      subtitle="Credits undergoing certification, registry processing, or tokenization."
      icon={<Verified />}
      loading={loading}
    />
  );
};

export default YellowPage;
