import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function TicketsLayout({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="w-full max-h-screen overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
