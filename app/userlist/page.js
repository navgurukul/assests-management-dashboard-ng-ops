import UsersList from '@/features/userlist/UsersList';

export const metadata = {
  title: 'User List',
};

export default function UserListPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <UsersList />
    </div>
  );
}
