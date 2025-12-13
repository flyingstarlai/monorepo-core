import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserGroups } from '../hooks/use-user-groups';
import type { UserGroupResponseDto } from '../dto/user-group-response.dto';

interface UserGroupsInfoProps {
  userId: string;
}

export function UserGroupsInfo({ userId }: UserGroupsInfoProps) {
  const { data: groups, isLoading, error } = useUserGroups(userId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 bg-slate-200 rounded mb-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
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
        <CardContent className="p-4">
          <div className="text-center text-slate-500">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>尚未加入任何群組</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Users className="h-5 w-5" />
          群組資訊
          <Badge variant="secondary" className="ml-auto">
            {groups.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <Badge
              key={group.id}
              variant={group.isActive ? 'success' : 'destructive'}
              className="px-3 py-2 text-sm"
            >
              {group.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
