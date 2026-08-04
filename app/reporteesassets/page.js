import ReporteesAssetsTab from "@/features/userprofile/tabs/ReporteesAssetsTab";

export default function ReporteesAssetsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Reportees Assets</h1>
        <p className="text-sm text-(--muted) mt-1">View assets allocated to your reportees</p>
      </div>
      <ReporteesAssetsTab />
    </div>
  );
}