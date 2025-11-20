import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { MobileAppOverviewDto } from '@/lib/mobile-apps.service';
import {
  getVersionStatus,
  compareVersions,
  type VersionStatus,
} from '@/lib/version-comparison.utils';

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
    accessorKey: 'latestVersion',
    header: '最新版本',
    sortingFn: (rowA, rowB) => {
      const versionA = rowA.getValue('latestVersion') as string | null;
      const versionB = rowB.getValue('latestVersion') as string | null;

      // Compare A to B for descending order (newest versions first)
      return compareVersions(versionA || '0.0.0', versionB || '0.0.0');
    },
    cell: ({ row }) => {
      const version = row.getValue('latestVersion') as string | null;
      const actualLatestVersion =
        (row.original.actualLatestVersion as string | null) || '0.0.0';

      const versionStatus: VersionStatus = getVersionStatus(
        version,
        actualLatestVersion,
      );

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={versionStatus.variant}
            className="text-xs font-medium"
          >
            {version || 'N/A'}
          </Badge>
          {versionStatus.status === 'outdated' && (
            <span className="text-xs text-orange-600" title="需要更新">
              ⚠️
            </span>
          )}
          {versionStatus.status === 'critical' && (
            <span className="text-xs text-red-600" title="急需更新">
              🚨
            </span>
          )}
          {versionStatus.status === 'latest' && (
            <span className="text-xs text-green-600" title="最新版本">
              ✅
            </span>
          )}
        </div>
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
];
