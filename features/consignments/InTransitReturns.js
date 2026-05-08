import { Truck } from 'lucide-react';

export const inTransitColumns = [
  { key: 'consignmentCode', label: 'CONSIGNMENT CODE'       },
  { key: 'assetTag',        label: 'ASSET TAG'         },
  { key: 'previousAssetTag', label: 'PREVIOUS ASSET TAG' },
  { key: 'model',           label: 'LAPTOP MODEL'      },
  { key: 'userName',        label: 'RETURNED BY'       },
  { key: 'trackingId',      label: 'TRACKING ID'       },
  { key: 'estimatedArrival',label: 'EST. ARRIVAL DATE' },
  { key: 'actions',         label: 'ACTION'            },
];

export function renderInTransitCell(item, columnKey) {
  const value = item[columnKey];

  switch (columnKey) {
    case 'consignmentCode':
      return <span className="font-medium text-blue-600">{value}</span>;

    case 'assetTag':
      return <span className="font-mono text-gray-800 text-xs">{value}</span>;

    case 'previousAssetTag':
      return <span className="font-mono text-gray-600 text-xs">{value || '-'}</span>;

    case 'userName':
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          {item.userEmail && (
            <span className="text-xs text-gray-400">{item.userEmail}</span>
          )}
        </div>
      );

    case 'trackingId':
      return <span className="font-mono text-gray-500 text-xs">{value}</span>;

    case 'estimatedArrival':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Truck className="w-3 h-3" />
          {value}
        </span>
      );

    default:
      return <span className="text-gray-700">{value}</span>;
  }
}
