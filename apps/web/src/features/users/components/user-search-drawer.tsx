import { useState, useEffect } from 'react';
import { useFactoryUsers } from '../hooks/use-users';
import type { FactoryUser } from '../types/user.types';
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

interface UserSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (user: FactoryUser) => void;
}

export function UserSearchDrawer({
  isOpen,
  onClose,
  onUserSelect,
}: UserSearchDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: factoryUsers = [],
    isLoading,
    error,
    refetch,
  } = useFactoryUsers();

  // Filter users based on search term
  const filteredUsers = factoryUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.deptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.deptName.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const handleUserSelect = (user: FactoryUser) => {
    onUserSelect(user);
    onClose();
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, user: FactoryUser) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserSelect(user);
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
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Factory User Lookup</h2>
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
              placeholder="Search factory users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Press <Kbd>Enter</Kbd> to select a user, <Kbd>Escape</Kbd> to close
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">
                Loading factory users...
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="text-sm text-red-600 mb-4">
                Failed to load factory users
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="h-full overflow-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-500">
                    {searchTerm
                      ? 'No factory users found matching your search'
                      : 'No factory users available'}
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Department Code</TableHead>
                      <TableHead>Department Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.username}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleUserSelect(user)}
                        onKeyDown={(e) => handleRowKeyDown(e, user)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Select ${user.fullName} (${user.username})`}
                      >
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.deptNo}</TableCell>
                        <TableCell>{user.deptName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
