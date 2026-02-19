import UsersList from '@/features/userlist/UsersList';

export const metadata = {
  title: 'User List',
};

export default function UserListPage() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <UsersList />
    </div>
  );
}
