import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, UserPlus, Settings } from 'lucide-react';
import { Link } from '@tanstack/react-router';

function UserGroupsPage() {
  // Mock data - in real implementation, this would come from API
  const userGroups = [
    {
      id: 1,
      name: '系統管理員',
      description: '擁有系統完整管理權限',
      memberCount: 5,
      permissions: ['用戶管理', '群組管理', '應用程式管理', 'App Builder'],
    },
    {
      id: 2,
      name: '資訊部',
      description: '負責系統開發和維護',
      memberCount: 12,
      permissions: ['用戶管理', '應用程式管理'],
    },
    {
      id: 3,
      name: '行銷團隊',
      description: '負責產品行銷和推廣',
      memberCount: 8,
      permissions: ['應用程式管理'],
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回用戶列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">用戶群組管理</h1>
            <p className="text-muted-foreground">管理用戶群組和權限分配</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            群組設定
          </Button>
          <Button asChild>
            <Link to="/groups/create">
              <UserPlus className="w-4 h-4 mr-2" />
              建立群組
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總群組數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups.length}</div>
            <p className="text-xs text-muted-foreground">活躍群組</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總成員數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGroups.reduce((sum, group) => sum + group.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">分配到各群組</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成員數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                userGroups.reduce((sum, group) => sum + group.memberCount, 0) /
                  userGroups.length,
              )}
            </div>
            <p className="text-xs text-muted-foreground">每個群組</p>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>群組列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{group.name}</h3>
                    <Badge variant="secondary">{group.memberCount} 成員</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {group.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {group.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="outline"
                        className="text-xs"
                      >
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    查看成員
                  </Button>
                  <Button variant="outline" size="sm">
                    編輯群組
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/users/groups')({
  component: UserGroupsPage,
});
