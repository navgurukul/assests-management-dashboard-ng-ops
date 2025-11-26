import TicketsList from '@/features/tickets/TicketsList';

export default function TicketsPage() {
  return (
    <div className="p-6 overflow-y-auto max-h-screen">
      <TicketsList />
    </div>
  );
}
