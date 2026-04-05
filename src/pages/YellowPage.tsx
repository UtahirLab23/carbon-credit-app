import React from 'react';
import { Verified } from '@mui/icons-material';
import CreditsTable from '../components/CreditsTable';
import { mockCreditRecords } from '../utils/mockData';

const YellowPage: React.FC = () => {
  const records = mockCreditRecords.filter((r) => r.status === 'yellow');
  return (
    <CreditsTable
      records={records}
      statusColor="#FFA726"
      statusLabel="Yellow"
      title="Credit Certification"
      subtitle="Credits undergoing certification, registry processing, or tokenization."
      icon={<Verified />}
    />
  );
};

export default YellowPage;
