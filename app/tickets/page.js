import TicketsList from '@/features/tickets/TicketsList';

export default function TicketsPage() {
  return (
    <div className="p-3 sm:p-6 overflow-y-auto h-full">
      <TicketsList />
    </div>
  );
}
