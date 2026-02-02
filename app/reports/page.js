import { ReportsList } from '@/features/reports';

export default function ReportsPage() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Reports</h2>
        <p className="text-gray-600 mt-2">View and analyze various reports</p>
      </div>
      <ReportsList />
    </div>
  );
}
