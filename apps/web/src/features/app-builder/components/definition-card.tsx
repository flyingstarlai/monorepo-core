import { Link, useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../components/ui/enhanced-card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import { cn } from '../../../lib/utils';
import {
  Smartphone,
  Package,
  Server,
  Rocket,
  Clock,
  MoreVertical,
  CheckCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import type { MobileAppDefinition } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useTriggerBuild } from '../hooks/use-app-builder';
import { useState } from 'react';

interface DefinitionCardProps {
  definition: MobileAppDefinition;
  onDelete?: (definition: MobileAppDefinition) => void;
  className?: string;
}

export function DefinitionCard({
  definition,
  onDelete,
  className,
}: DefinitionCardProps) {
  const navigate = useNavigate();
  const triggerBuild = useTriggerBuild();
  const [isBuilding, setIsBuilding] = useState(false);

  const getStatusBadge = () => (
    <Badge variant="default" className="flex items-center gap-1 w-fit">
      <CheckCircle className="w-3 h-3" />
      Configured
    </Badge>
  );

  const handleBuild = async () => {
    if (isBuilding) return;

    setIsBuilding(true);
    try {
      const result = await triggerBuild.mutateAsync({
        appDefinitionId: definition.id,
      });

      // Navigate to monitor the new build
      navigate({
        to: '/app-builder/$id/build',
        params: { id: definition.id },
        search: { buildId: result.buildId },
      });
    } catch (error) {
      console.error('Failed to trigger build:', error);
      // Could add toast notification here
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <Card variant="definition" className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-3">
          <div className="icon-container">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {definition.appName}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {definition.appId}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* App Metadata */}
          <dl className="space-y-3">
            {definition.company && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-1">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-700">
                  <Building2 className="w-4 h-4" />
                  Company
                </dt>
                <dd className="text-sm font-medium text-blue-900">
                  {definition.company.companyName}
                </dd>
              </div>
            )}
            <div className="rounded-md border border-border/60 bg-muted/40 p-3 space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Package className="w-4 h-4" />
                Module
              </dt>
              <dd className="text-sm break-words">{definition.appModule}</dd>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/40 p-3 space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Server className="w-4 h-4" />
                Server
              </dt>
              <dd className="text-sm font-mono break-all">
                {definition.serverIp}
              </dd>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/40 p-3 space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="w-4 h-4" />
                Last Build
              </dt>
              <dd className="text-sm">
                {definition.updatedAt
                  ? formatDistanceToNow(new Date(definition.updatedAt), {
                      addSuffix: true,
                    })
                  : 'Never'}
              </dd>
            </div>
          </dl>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBuilding || triggerBuild.isPending}
                >
                  {isBuilding || triggerBuild.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-2" />
                  )}
                  {isBuilding || triggerBuild.isPending
                    ? 'Building...'
                    : 'Build'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Trigger New Build</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to trigger a new build for{' '}
                    <strong>{definition.appName}</strong>? This will start the
                    build process and may take several minutes to complete.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBuild}
                    disabled={isBuilding || triggerBuild.isPending}
                  >
                    {isBuilding || triggerBuild.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Trigger Build
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/app-builder/$id/history"
                params={{ id: definition.id }}
              >
                <Clock className="w-4 h-4 mr-2" />
                History
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(definition)}
            >
              <MoreVertical className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
