import RoleGuard from '@/components/auth/RoleGuard';
import UsersClient from '@/components/users/UsersClient';

export default function UsersPage() {
  return (
    <RoleGuard allowed={['Admin', 'Manager']}>
      <UsersClient />
    </RoleGuard>
  );
}
