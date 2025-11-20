import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { MobileAppOverviewDto } from '@/lib/mobile-apps.service';

export const appsColumns: ColumnDef<MobileAppOverviewDto>[] = [
  {
    accessorKey: 'appName',
    header: '應用程式名稱',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('appName')}</div>
    ),
  },
  {
    accessorKey: 'appId',
    header: '應用程式 ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('appId')}</div>
    ),
  },
  {
    accessorKey: 'latestVersion',
    header: '最新版本',
    cell: ({ row }) => {
      const version = row.getValue('latestVersion') as string | null;
      return (
        <Badge variant="secondary" className="text-xs">
          {version || 'N/A'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'activeDevices',
    header: '活躍設備',
    cell: ({ row }) => (
      <span className="text-green-600 font-medium">
        {row.getValue('activeDevices')}
      </span>
    ),
  },
  {
    accessorKey: 'totalDevices',
    header: '總設備數',
    cell: ({ row }) => row.getValue('totalDevices'),
  },
  {
    accessorKey: 'uniqueUsers',
    header: '獨特用戶',
    cell: ({ row }) => row.getValue('uniqueUsers'),
  },
];
