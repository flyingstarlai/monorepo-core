import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import { Calendar } from '../../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Label } from '../../../components/ui/label';
import { CalendarIcon, Filter, X, RotateCcw } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '../../../lib/utils';
import type { MobileAppDefinition, DashboardModule } from '../types';

export interface BuildFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  statuses: string[];
  appIds: string[];
  modules: string[];
  startedBy?: string;
  buildNumber?: {
    from?: number;
    to?: number;
  };
}

interface BuildHistoryFiltersProps {
  filters: BuildFilters;
  onFiltersChange: (filters: BuildFilters) => void;
  definitions: MobileAppDefinition[];
  modules: DashboardModule[];
  onReset?: () => void;
}

const statusOptions = [
  { value: 'queued', label: 'Queued' },
  { value: 'building', label: 'Building' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const datePresets = [
  { label: 'Last 24 hours', from: subDays(new Date(), 1), to: new Date() },
  { label: 'Last 7 days', from: subDays(new Date(), 7), to: new Date() },
  { label: 'Last 30 days', from: subDays(new Date(), 30), to: new Date() },
  { label: 'Last 3 months', from: subDays(new Date(), 90), to: new Date() },
];

export function BuildHistoryFilters({
  filters,
  onFiltersChange,
  definitions,
  modules,
  onReset,
}: BuildHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.statuses, status]
      : filters.statuses.filter((s) => s !== status);

    onFiltersChange({
      ...filters,
      statuses: newStatuses,
    });
  };

  const handleAppIdChange = (appId: string, checked: boolean) => {
    const newAppIds = checked
      ? [...filters.appIds, appId]
      : filters.appIds.filter((id) => id !== appId);

    onFiltersChange({
      ...filters,
      appIds: newAppIds,
    });
  };

  const handleModuleChange = (moduleId: string, checked: boolean) => {
    const newModules = checked
      ? [...filters.modules, moduleId]
      : filters.modules.filter((m) => m !== moduleId);

    onFiltersChange({
      ...filters,
      modules: newModules,
    });
  };

  const handleDatePreset = (preset: (typeof datePresets)[0]) => {
    onFiltersChange({
      ...filters,
      dateRange: preset,
    });
  };

  const handleDateRangeChange = (dateRange: { from?: Date; to?: Date }) => {
    if (dateRange.from && dateRange.to) {
      onFiltersChange({
        ...filters,
        dateRange: {
          from: dateRange.from,
          to: dateRange.to,
        },
      });
    }
  };

  const clearDateRange = () => {
    onFiltersChange({
      ...filters,
      dateRange: undefined,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      statuses: [],
      appIds: [],
      modules: [],
      startedBy: undefined,
      buildNumber: undefined,
      dateRange: undefined,
    });
    onReset?.();
  };

  // Get unique app IDs from definitions
  const uniqueAppIds = Array.from(
    new Set(definitions.map((def) => def.appId)),
  ).sort();

  const hasActiveFilters = Boolean(
    filters.statuses.length > 0 ||
      filters.appIds.length > 0 ||
      filters.modules.length > 0 ||
      filters.startedBy ||
      filters.buildNumber?.from ||
      filters.buildNumber?.to ||
      filters.dateRange,
  );

  return (
    <div className="space-y-4">
      {/* Filter toggle button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {filters.statuses.length +
                filters.appIds.length +
                filters.modules.length +
                (filters.startedBy ? 1 : 0) +
                (filters.buildNumber?.from || filters.buildNumber?.to ? 1 : 0) +
                (filters.dateRange ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center space-x-1 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {isOpen && (
        <div className="border rounded-lg p-6 space-y-6 bg-muted/20">
          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDatePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-64 justify-start text-left font-normal',
                      !filters.dateRange && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                          {format(filters.dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(filters.dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={
                      filters.dateRange
                        ? {
                            from: filters.dateRange.from,
                            to: filters.dateRange.to,
                          }
                        : undefined
                    }
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    required
                  />
                </PopoverContent>
              </Popover>

              {filters.dateRange && (
                <Button variant="ghost" size="sm" onClick={clearDateRange}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.statuses.includes(status.value)}
                    onCheckedChange={(checked) =>
                      handleStatusChange(status.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`status-${status.value}`} className="text-sm">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* App ID Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">App ID</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {uniqueAppIds.map((appId) => (
                <div key={appId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`appid-${appId}`}
                    checked={filters.appIds.includes(appId)}
                    onCheckedChange={(checked) =>
                      handleAppIdChange(appId, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`appid-${appId}`}
                    className="text-sm truncate"
                  >
                    {appId}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Module Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Module</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={filters.modules.includes(module.id)}
                    onCheckedChange={(checked) =>
                      handleModuleChange(module.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`module-${module.id}`}
                    className="text-sm truncate"
                  >
                    {module.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Started By Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Started By</Label>
            <Input
              placeholder="Enter username..."
              value={filters.startedBy || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  startedBy: e.target.value || undefined,
                })
              }
            />
          </div>

          {/* Build Number Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Build Number</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="From"
                value={filters.buildNumber?.from || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    buildNumber: {
                      ...filters.buildNumber,
                      from: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="w-32"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="To"
                value={filters.buildNumber?.to || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    buildNumber: {
                      ...filters.buildNumber,
                      to: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="w-32"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
