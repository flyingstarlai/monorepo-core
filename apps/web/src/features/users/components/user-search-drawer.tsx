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
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">工廠用戶查詢</h2>
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
              placeholder="搜尋工廠用戶..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          <p className="text-sm text-gray-500 mt-2">
            按 <Kbd>Enter</Kbd> 選擇用戶，<Kbd>Escape</Kbd> 關閉
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">
                載入工廠用戶中...
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="text-sm text-red-600 mb-4">
                載入工廠用戶失敗
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                重試
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="h-full overflow-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-500">
                    {searchTerm
                      ? '找不到符合您搜尋的工廠用戶'
                      : '沒有可用的工廠用戶'}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用戶名</TableHead>
                        <TableHead>全名</TableHead>
                        <TableHead>部門代碼</TableHead>
                        <TableHead>部門名稱</TableHead>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
