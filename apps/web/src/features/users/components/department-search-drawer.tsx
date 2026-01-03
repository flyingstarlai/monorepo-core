import { useState, useEffect } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useFactoryDepartments } from '../hooks/use-users';
import type { Department } from '../types/user.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, X } from 'lucide-react';

interface DepartmentSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentSelect: (department: Department) => void;
}

export function DepartmentSearchDrawer({
  isOpen,
  onClose,
  onDepartmentSelect,
}: DepartmentSearchDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: factoryDepartments = [],
    isLoading,
    error,
    refetch,
  } = useFactoryDepartments();

  // Filter departments based on search term
  const filteredDepartments = factoryDepartments.filter(
    (department) =>
      department.deptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.deptName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle keyboard events (Escape closes drawer)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleDepartmentSelect = (department: Department) => {
    onDepartmentSelect(department);
    onClose();
  };

  const handleRowKeyDown = (
    e: ReactKeyboardEvent<HTMLTableRowElement>,
    department: Department,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDepartmentSelect(department);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">工廠部門查詢</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="搜尋工廠部門..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            按 <Kbd>Enter</Kbd> 選擇部門，<Kbd>Escape</Kbd> 關閉
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-gray-500">載入工廠部門中...</div>
            </div>
          )}

          {error && (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <div className="mb-4 text-sm text-red-600">載入工廠部門失敗</div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                重試
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="h-full overflow-auto">
              {filteredDepartments.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-sm text-gray-500">
                    {searchTerm
                      ? '找不到符合您搜尋的工廠部門'
                      : '沒有可用的工廠部門'}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>部門代碼</TableHead>
                        <TableHead>部門名稱</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDepartments.map((department) => (
                        <TableRow
                          key={department.deptNo}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleDepartmentSelect(department)}
                          onKeyDown={(e) => handleRowKeyDown(e, department)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Select ${department.deptName} (${department.deptNo})`}
                        >
                          <TableCell className="font-medium">
                            {department.deptNo}
                          </TableCell>
                          <TableCell>{department.deptName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
