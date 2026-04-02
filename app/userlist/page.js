import UsersList from '@/features/userlist/UsersList';

export const metadata = {
  title: 'User List',
};

export default function UserListPage() {
  return (
    <div className="overflow-y-auto h-full">
      <UsersList />
    </div>
  );
}
