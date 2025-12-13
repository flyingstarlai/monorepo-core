import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingOverlay } from '@/components/ui/loading';
import { useUserGroups } from '../hooks/use-user-groups';
import { format } from 'date-fns';
import type { UserGroupResponseDto } from '../dto/user-group-response.dto';

interface UserGroupsProps {
  userId: string;
}

export function UserGroups({ userId }: UserGroupsProps) {
  const { data: groups, isLoading, error } = useUserGroups(userId);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <LoadingOverlay
            isLoading={true}
            message="載入群組資訊..."
            className="w-full"
          />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            載入群組資訊時發生錯誤，請稍後再試。
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!groups?.length) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              尚未加入任何群組
            </h3>
            <p className="text-slate-600">此用戶目前不屬於任何群組。</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">群組成員資格</h3>
        <Badge variant="secondary" className="text-xs">
          {groups.length} 個群組
        </Badge>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{group.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={group.isActive ? 'success' : 'destructive'}>
                      {group.isActive ? '啟用' : '停用'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {group.memberCount} 成員
                    </Badge>
                  </div>
                </div>
                {group.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    加入於{' '}
                    {format(new Date(group.membershipCreatedAt), 'yyyy/MM/dd')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
