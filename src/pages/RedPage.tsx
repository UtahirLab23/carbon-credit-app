import React from 'react';
import { Construction } from '@mui/icons-material';
import CreditsTable from '../components/CreditsTable';
import { mockCreditRecords } from '../utils/mockData';
import { useAuth } from '../features/auth/AuthContext';
import { useProjects, useWells } from '../hooks/useInvestorApi';
import { wellToRecord } from '../utils/apiMappers';

const RedPage: React.FC = () => {
  const { apiCredentials } = useAuth();
  const { data: projects } = useProjects();
  const firstProjectId = projects?.[0]?.id ?? null;
  const { data: wells, loading } = useWells(firstProjectId);

  const records = apiCredentials && wells
    ? wells.map(wellToRecord).filter((r) => r.status === 'red')
    : mockCreditRecords.filter((r) => r.status === 'red');

  return (
    <CreditsTable
      records={records}
      statusColor="#EF5350"
      statusLabel="Red"
      title="Operations In Progress"
      subtitle="Credits associated with field operations currently in progress."
      icon={<Construction />}
      loading={loading}
    />
  );
};

export default RedPage;
