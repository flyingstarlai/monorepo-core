import { useState, useMemo, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  Eye,
  RotateCcw,
  Trash2,
  Filter,
  Search,
  GitCompare,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import type {
  MobileAppBuild,
  BuildFilters,
  PaginatedResult,
  PaginationOptions,
} from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../../../lib/utils';

interface BuildHistoryTableProps {
  builds: PaginatedResult<MobileAppBuild>;
  isLoading?: boolean;
  onFiltersChange: (filters: BuildFilters) => void;
  onPaginationChange: (pagination: PaginationOptions) => void;
  onBuildSelect?: (builds: MobileAppBuild[]) => void;
  onBuildAction?: (action: string, build: MobileAppBuild) => void;
  selectedBuilds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  definitions?: any[];
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (build: MobileAppBuild) => React.ReactNode;
}

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  building: 'bg-blue-100 text-blue-800',
  queued: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  building: <Play className="h-4 w-4 text-blue-500" />,
  queued: <Clock className="h-4 w-4 text-yellow-500" />,
  cancelled: <AlertCircle className="h-4 w-4 text-gray-500" />,
};

function formatDuration(duration?: number): string {
  if (!duration) return 'N/A';

  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${Math.round(duration / 1000)}s`;
  return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;
}

function getStatusIcon(status: string) {
  return statusIcons[status as keyof typeof statusIcons] || statusIcons.queued;
}

export function BuildHistoryTable({
  builds,
  isLoading = false,
  onFiltersChange,
  onPaginationChange,
  onBuildSelect,
  onBuildAction,
  selectedBuilds = [],
  onSelectionChange,
  definitions = [],
}: BuildHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BuildFilters>({});
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: builds.page,
    limit: builds.limit,
    sort: 'createdAt',
    order: 'desc',
  });

  const definitionMap = useMemo(() => {
    const map = new Map();
    definitions.forEach((def) => map.set(def.id, def));
    return map;
  }, [definitions]);

  const handleSort = (column: string) => {
    const newOrder =
      pagination.sort === column && pagination.order === 'desc'
        ? 'asc'
        : 'desc';
    const newPagination = { ...pagination, sort: column, order: newOrder };
    setPagination(newPagination);
    onPaginationChange(newPagination);
  };

  const handlePageChange = (page: number) => {
    const newPagination = { ...pagination, page };
    setPagination(newPagination);
    onPaginationChange(newPagination);
  };

  const handleLimitChange = (limit: number) => {
    const newPagination = { ...pagination, page: 1, limit };
    setPagination(newPagination);
    onPaginationChange(newPagination);
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const newFilters = { ...filters, searchQuery: query || undefined };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange],
  );

  const handleFilterChange = (key: keyof BuildFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRowSelection = (buildId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedBuilds, buildId]
      : selectedBuilds.filter((id) => id !== buildId);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? builds.data.map((build) => build.id) : [];
    onSelectionChange?.(newSelection);
  };

  const isAllSelected =
    builds.data.length > 0 && selectedBuilds.length === builds.data.length;
  const isPartiallySelected =
    selectedBuilds.length > 0 && selectedBuilds.length < builds.data.length;

  const columns: Column[] = [
    {
      key: 'selection',
      label: '',
      width: '40px',
      render: (build) => (
        <Checkbox
          checked={selectedBuilds.includes(build.id)}
          onCheckedChange={(checked) =>
            handleRowSelection(build.id, checked as boolean)
          }
        />
      ),
    },
    {
      key: 'id',
      label: 'Build ID',
      sortable: true,
      width: '120px',
      render: (build) => (
        <span className="font-mono text-sm">{build.id.slice(-8)}</span>
      ),
    },
    {
      key: 'appName',
      label: 'App Name',
      sortable: true,
      render: (build) => (
        <div>
          <div className="font-medium">
            {definitionMap.get(build.appDefinitionId)?.appName || 'Unknown'}
          </div>
          <div className="text-sm text-muted-foreground">
            {definitionMap.get(build.appDefinitionId)?.appId}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (build) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(build.status)}
          <Badge
            className={statusColors[build.status as keyof typeof statusColors]}
          >
            {build.status.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: 'buildStage',
      label: 'Current Stage',
      width: '120px',
      render: (build) => (
        <div>
          {build.buildStage ? (
            <div>
              <div className="text-sm font-medium">{build.buildStage}</div>
              {build.stageProgressPercent !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${build.stageProgressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      width: '100px',
      render: (build) => (
        <span className="font-mono text-sm">
          {formatDuration(build.durationMs)}
        </span>
      ),
    },
    {
      key: 'startedAt',
      label: 'Started',
      sortable: true,
      width: '140px',
      render: (build) => (
        <div>
          {build.startedAt ? (
            <>
              <div className="text-sm">
                {format(new Date(build.startedAt), 'MMM dd, HH:mm')}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(build.startedAt), {
                  addSuffix: true,
                })}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Not started</span>
          )}
        </div>
      ),
    },
    {
      key: 'startedBy',
      label: 'Started By',
      sortable: true,
      width: '120px',
      render: (build) => build.startedBy,
    },
    {
      key: 'buildType',
      label: 'Type',
      width: '80px',
      render: (build) => (
        <Badge
          variant={build.buildType === 'release' ? 'default' : 'secondary'}
        >
          {build.buildType?.toUpperCase() || 'DEBUG'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (build) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBuildAction?.('view', build)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {build.artifactPath && (
              <DropdownMenuItem
                onClick={() => onBuildAction?.('download', build)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onBuildAction?.('rebuild', build)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Rebuild
            </DropdownMenuItem>
            {selectedBuilds.length > 0 && (
              <DropdownMenuItem
                onClick={() =>
                  onBuildSelect?.(
                    builds.data.filter((b) => selectedBuilds.includes(b.id)),
                  )
                }
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare Selected
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onBuildAction?.('delete', build)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search builds..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {Object.values(filters).filter((v) => v !== undefined).length >
                0 && (
                <Badge variant="secondary">
                  {Object.values(filters).filter((v) => v !== undefined).length}
                </Badge>
              )}
            </Button>

            {selectedBuilds.length > 0 && (
              <Button
                variant="default"
                onClick={() =>
                  onBuildSelect?.(
                    builds.data.filter((b) => selectedBuilds.includes(b.id)),
                  )
                }
                className="flex items-center space-x-2"
              >
                <GitCompare className="h-4 w-4" />
                <span>Compare ({selectedBuilds.length})</span>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.statuses?.[0] || ''}
                onValueChange={(value) =>
                  handleFilterChange('statuses', value ? [value] : undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.buildType || ''}
                onValueChange={(value) =>
                  handleFilterChange('buildType', value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Build Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.isAutomated?.toString() || ''}
                onValueChange={(value) =>
                  handleFilterChange(
                    'isAutomated',
                    value === 'true'
                      ? true
                      : value === 'false'
                        ? false
                        : undefined,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Automated</SelectItem>
                  <SelectItem value="false">Manual</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Started by..."
                value={filters.startedBy || ''}
                onChange={(e) =>
                  handleFilterChange('startedBy', e.target.value || undefined)
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Build Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Build History</span>
            <div className="text-sm text-muted-foreground">
              {builds.total} builds total
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(ref) => {
                        if (ref) {
                          ref.indeterminate = isPartiallySelected;
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                          onClick={() => handleSort(column.key)}
                        >
                          {column.label}
                          <ChevronLeft
                            className={cn(
                              'ml-2 h-4 w-4',
                              pagination.sort === column.key &&
                                pagination.order === 'asc'
                                ? 'rotate-90'
                                : '',
                              pagination.sort === column.key &&
                                pagination.order === 'desc'
                                ? '-rotate-90'
                                : '',
                            )}
                          />
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Activity className="h-4 w-4 animate-spin" />
                        <span>Loading builds...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : builds.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="text-muted-foreground">
                        No builds found matching your criteria
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  builds.data.map((build) => (
                    <TableRow
                      key={build.id}
                      className={cn(
                        'hover:bg-muted/50 cursor-pointer',
                        selectedBuilds.includes(build.id) && 'bg-blue-50/50',
                      )}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render
                            ? column.render(build)
                            : (build as any)[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) => handleLimitChange(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Page {pagination.page} of {builds.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= builds.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(builds.totalPages)}
                disabled={pagination.page >= builds.totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
