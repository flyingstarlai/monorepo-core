import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Users, UserPlus, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingOverlay } from '@/components/ui/loading';
import {
  useGroup,
  useGroupMembers,
  useRemoveGroupMember,
} from '../hooks/use-groups';
import { AddMembersDialog } from './add-members-dialog';
import { format } from 'date-fns';
import {
  getUserDisplayName,
  getUserInitials,
  getRoleVariant,
  getRoleColor,
  getStatusVariant,
} from '@/features/users/utils/user-transformers';

interface GroupMembersPageProps {
  groupId: string;
}

export function GroupMembersPage({ groupId }: GroupMembersPageProps) {
  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId);
  const removeMutation = useRemoveGroupMember(groupId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const memberIds = useMemo(
    () => members?.map((member) => member.id) ?? [],
    [members],
  );

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members || [];
    const keyword = search.trim().toLowerCase();
    return (members || []).filter((member) => {
      const fullName = member.fullName || '';
      const username = member.username || '';
      const deptName = member.deptName || '';
      return (
        fullName.toLowerCase().includes(keyword) ||
        username.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword)
      );
    });
  }, [members, search]);

  const handleRemove = async (userId: string) => {
    await removeMutation.mutateAsync(userId);
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" asChild>
        <Link to="/groups">&larr; 返回群組列表</Link>
      </Button>

      <LoadingOverlay isLoading={groupLoading} message="載入群組資訊...">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" /> {group?.name ?? '群組'}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {group?.description || '尚未提供描述'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={group?.isActive ? 'success' : 'destructive'}>
                {group?.isActive ? '啟用中' : '已停用'}
              </Badge>
              <Button
                onClick={() => setAddDialogOpen(true)}
                disabled={!group?.isActive}
              >
                <UserPlus className="mr-2 h-4 w-4" /> 新增成員
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">群組成員</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredMembers.length} / {members?.length || 0}
                </Badge>
                <div className="relative ml-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋成員..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-48 h-9 text-sm"
                  />
                </div>
              </div>

              <LoadingOverlay
                isLoading={membersLoading}
                message="載入成員中..."
                className="w-full"
              >
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          成員
                        </TableHead>
                        <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          部門
                        </TableHead>
                        <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          角色
                        </TableHead>
                        <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          狀態
                        </TableHead>
                        <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                          加入時間
                        </TableHead>
                        <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24 text-right">
                          操作
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!membersLoading &&
                        (!filteredMembers || filteredMembers.length === 0) && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <Users className="h-8 w-8 text-muted-foreground/50" />
                                <span>
                                  {search ? '找不到符合的成員' : '目前尚無成員'}
                                </span>
                                {search && (
                                  <span className="text-sm text-muted-foreground">
                                    正在搜尋 "{search}"
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      {filteredMembers?.map((member) => (
                        <TableRow
                          key={member.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {getUserInitials(member)}
                                </span>
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${!member.fullName ? 'text-slate-500' : 'text-slate-900'}`}
                                >
                                  {getUserDisplayName(member)}
                                </div>
                                <div className="text-sm text-slate-500">
                                  @{member.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div>
                              <div className="font-medium">
                                {member.deptName || '未指定'}
                              </div>
                              <div className="text-sm text-slate-500">
                                {member.deptNo || '未指定'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Badge
                              variant={getRoleVariant(member.role)}
                              style={{
                                backgroundColor: getRoleColor(member.role),
                                color: 'white',
                                borderColor: getRoleColor(member.role),
                              }}
                            >
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Badge
                              variant={getStatusVariant(
                                member.isActive ?? false,
                              )}
                            >
                              {member.isActive ? '啟用' : '停用'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-muted-foreground">
                            {format(
                              new Date(member.membershipCreatedAt),
                              'yyyy/MM/dd HH:mm',
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(member.id)}
                              disabled={removeMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </LoadingOverlay>
            </div>
          </CardContent>
        </Card>
      </LoadingOverlay>

      <AddMembersDialog
        groupId={groupId}
        excludedUserIds={memberIds}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
