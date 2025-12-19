import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  ChevronDown,
  Download,
  Eye,
} from 'lucide-react';
import type { MobileAppBuild } from '../types';

interface BuildHistoryTableProps {
  builds: MobileAppBuild[];
  definitions?: any[];
  isLoading?: boolean;
  onBuildAction?: (build: MobileAppBuild, action: string) => void;

  onSelectionChange?: (selectedIds: string[]) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  selectedBuildIds?: string[];
  onRefresh?: () => void;
}

export function BuildHistoryTable({
  builds,
  definitions = [],
  isLoading = false,
  onBuildAction,
  onSelectionChange,
  onSort,
  sortField = 'createdAt',
  sortDirection = 'desc',
  selectedBuildIds = [],
}: BuildHistoryTableProps) {
  const [selectedBuilds, setSelectedBuilds] = React.useState<string[]>(selectedBuildIds);

  const handleSortChange = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort?.(field, newDirection);
  };

  const handleSelectionChange = (buildId: string, selected: boolean) => {
    const newSelection = selected
      ? [...selectedBuilds, buildId]
      : selectedBuilds.filter(id => id !== buildId);
    setSelectedBuilds(newSelection);
    onSelectionChange?.(newSelection);
  };



  const sortedBuilds = React.useMemo(() => {
    return [...builds].sort((a, b) => {
      let aValue: any = a[sortField as keyof MobileAppBuild];
      let bValue: any = b[sortField as keyof MobileAppBuild];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [builds, sortField, sortDirection]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'building':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatDistanceToNow = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatStageDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getAppName = (build: MobileAppBuild) => {
    const definition = definitions.find(def => def.id === build.appDefinitionId);
    return definition?.appName || 'Unknown App';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Build History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build History</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {sortedBuilds.length} builds
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('createdAt')}
            >
              Created Date
              {sortField === 'createdAt' && (
                <ChevronDown className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'rotate-180'}`} />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('status')}
            >
              Status
              {sortField === 'status' && (
                <ChevronDown className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'rotate-180'}`} />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {sortedBuilds.map((build) => (
              <TableRow key={build.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedBuilds.includes(build.id)}
                      onChange={(e) => handleSelectionChange(build.id, e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-medium">{build.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(build.status)}>
                    {build.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{getAppName(build)}</TableCell>
                <TableCell>{formatDistanceToNow(build.createdAt)}</TableCell>
                <TableCell>
                  {build.durationMs ? formatStageDuration(build.durationMs) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBuildAction?.(build, 'view')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {build.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBuildAction?.(build, 'download')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sortedBuilds.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No builds found
          </div>
        )}
      </CardContent>
    </Card>
  );
}