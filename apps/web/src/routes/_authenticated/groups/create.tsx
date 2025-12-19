import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';

function CreateGroupPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/groups">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回群組列表
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">建立群組</h1>
          <p className="text-muted-foreground">
            創建新的用戶群組來管理權限和資源存取
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">群組名稱 *</Label>
                <Input id="group-name" placeholder="輸入群組名稱" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">群組描述</Label>
                <Textarea
                  id="group-description"
                  placeholder="描述此群組的用途和權限範圍"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-department">所屬部門</Label>
                <Input
                  id="group-department"
                  placeholder="例如：資訊部、行銷部"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>權限設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>群組權限</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id="perm-users"
                      className="rounded"
                    />
                    <Label htmlFor="perm-users" className="flex-1">
                      <div className="font-medium">用戶管理</div>
                      <div className="text-sm text-muted-foreground">
                        查看和管理用戶
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id="perm-groups"
                      className="rounded"
                    />
                    <Label htmlFor="perm-groups" className="flex-1">
                      <div className="font-medium">群組管理</div>
                      <div className="text-sm text-muted-foreground">
                        管理用戶群組
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="perm-apps" className="rounded" />
                    <Label htmlFor="perm-apps" className="flex-1">
                      <div className="font-medium">應用程式管理</div>
                      <div className="text-sm text-muted-foreground">
                        管理應用程式存取
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id="perm-builder"
                      className="rounded"
                    />
                    <Label htmlFor="perm-builder" className="flex-1">
                      <div className="font-medium">App Builder</div>
                      <div className="text-sm text-muted-foreground">
                        建立和管理應用
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline">取消</Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              建立群組
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                快速提示
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">群組命名規則</h4>
                <p className="text-sm text-muted-foreground">
                  使用描述性的名稱，例如：「資訊部管理員」、「行銷團隊」等
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">權限分配</h4>
                <p className="text-sm text-muted-foreground">
                  根據工作職能分配最小必要權限，確保安全性
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">群組規模</h4>
                <p className="text-sm text-muted-foreground">
                  建議每個群組不超過 20 人，便於管理
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>現有群組</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">系統管理員</span>
                  <Badge variant="secondary">5 成員</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">資訊部</span>
                  <Badge variant="secondary">12 成員</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">行銷團隊</span>
                  <Badge variant="secondary">8 成員</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/groups/create')({
  component: CreateGroupPage,
});
