import React from 'react';
import { Construction } from '@mui/icons-material';
import CreditsTable from '../components/CreditsTable';
import { mockCreditRecords } from '../utils/mockData';

const RedPage: React.FC = () => {
  const records = mockCreditRecords.filter((r) => r.status === 'red');
  return (
    <CreditsTable
      records={records}
      statusColor="#EF5350"
      statusLabel="Red"
      title="Operations In Progress"
      subtitle="Credits associated with field operations currently in progress."
      icon={<Construction />}
    />
  );
};

export default RedPage;
