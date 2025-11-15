import { useState, useEffect } from 'react';
import { useFactoryDepartments } from '../hooks/use-users';
import type { FactoryDepartment } from '../types/user.types';
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
  onDepartmentSelect: (department: FactoryDepartment) => void;
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
      department.deptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.deptName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle keyboard events
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleDepartmentSelect = (department: FactoryDepartment) => {
    onDepartmentSelect(department);
    onClose();
  };

  const handleRowKeyDown = (
    e: React.KeyboardEvent,
    department: FactoryDepartment,
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
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Factory Department Lookup</h2>
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
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search factory departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Press <Kbd>Enter</Kbd> to select a department, <Kbd>Escape</Kbd> to
            close
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">
                Loading factory departments...
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="text-sm text-red-600 mb-4">
                Failed to load factory departments
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="h-full overflow-auto">
              {filteredDepartments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-500">
                    {searchTerm
                      ? 'No factory departments found matching your search'
                      : 'No factory departments available'}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Code</TableHead>
                        <TableHead>Department Name</TableHead>
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
