import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { Link } from '@tanstack/react-router';
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
    cell: ({ row }) => {
      const appId = row.getValue('appId') as string;
      return <div className="font-mono text-sm">{appId}</div>;
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
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const appId = row.getValue('appId') as string;
      const appName = row.original.appName;

      return (
        <Link to="/apps/$id" params={{ id: appId }} search={{ appName }}>
          <Button variant="outline" size="sm">
            <Smartphone className="h-4 w-4 mr-2" />
            查看設備
          </Button>
        </Link>
      );
    },
  },
];
