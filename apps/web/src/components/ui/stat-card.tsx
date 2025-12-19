import { Card, CardContent, CardHeader } from './enhanced-card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card variant="stat" className={cn('relative', className)}>
      <CardHeader className="flex flex-row items-center space-x-3 pb-2">
        <div className="icon-container primary">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {trend && (
          <div className={cn('flex items-center text-sm', getTrendColor())}>
            <span className="mr-1">{getTrendIcon()}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
