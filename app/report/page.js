export default function Report() {
  const reports = [
    { name: "Allocation Summary", purpose: "Live device usage" },
    { name: "Ticket SLA", purpose: "IT performance" },
    { name: "Movement Tracking", purpose: "Audit chain of custody" },
    { name: "Vendor & Courier Cost", purpose: "Finance governance" },
    { name: "Parts Utilization", purpose: "Sustainability" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-6">
        Reporting
      </h1>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Filter Row */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-slate-600">
            Campus
          </span>

          <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All</option>
            <option>Sarjapur</option>
            <option>Pune</option>
            <option>Dantewada</option>
            <option>Kishanganj</option>
            <option>Himachal</option>
            <option>Dharmshala</option>
            <option>Raigargh</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-sm font-semibold text-slate-600 pb-3">
                Report
              </th>
              <th className="text-left text-sm font-semibold text-slate-600 pb-3">
                Purpose
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.map((r, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-4 text-sm font-medium">
                  {r.name}
                </td>
                <td className="py-4 text-sm text-slate-600">
                  {r.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
