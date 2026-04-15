import { Suspense } from 'react';
import SettingsClient from '@/components/settings/SettingsClient';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div />}>
      <SettingsClient />
    </Suspense>
  );
}
