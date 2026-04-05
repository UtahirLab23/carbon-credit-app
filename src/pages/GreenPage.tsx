import React from 'react';
import { AccountBalanceWallet } from '@mui/icons-material';
import CreditsTable from '../components/CreditsTable';
import { mockCreditRecords } from '../utils/mockData';

const GreenPage: React.FC = () => {
  const records = mockCreditRecords.filter((r) => r.status === 'green');
  return (
    <CreditsTable
      records={records}
      statusColor="#66BB6A"
      statusLabel="Green"
      title="Credits Issued"
      subtitle="Credits fully issued, tokenized, and held in the High Intensity Vault."
      icon={<AccountBalanceWallet />}
    />
  );
};

export default GreenPage;
