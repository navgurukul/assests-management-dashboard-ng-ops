import TicketsTable from "@/features/tickets/TicketsTable";
import { TicketStatusTab } from "@/features/userprofile/tabs";

export default function TicketStatusPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TicketStatusTab />
    </div>
  );
}
