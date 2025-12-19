import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { useState } from 'react';
import {
  Download,
  ExternalLink,
  RefreshCw,
  Trash2,
  Copy,
  Eye,
  GitCompare,
  MoreHorizontal,
  Square,
  AlertCircle,
} from 'lucide-react';
import type { MobileAppBuild } from '../types';
import { useAuth } from '../../../features/auth/hooks/use-auth';
import { toast } from 'sonner';

interface BuildActionButtonsProps {
  build: MobileAppBuild;
  onAction?: (build: MobileAppBuild, action: string, data?: any) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabels?: boolean;
}

interface ActionConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  requiresRole?: string[];
  requiresStatus?: string[];
  confirm?: {
    title: string;
    description: string;
    confirmText?: string;
  };
  handler: (build: MobileAppBuild) => Promise<void> | void;
}

export function BuildActionButtons({
  build,
  onAction,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  showLabels = false,
}: BuildActionButtonsProps) {
  const { user } = useAuth();
  const [confirmAction, setConfirmAction] = useState<ActionConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const hasRole = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const hasStatus = (statuses: string[]) => {
    return statuses.includes(build.status);
  };

  const handleAction = async (action: ActionConfig) => {
    if (action.confirm) {
      setConfirmAction(action);
      return;
    }

    executeAction(action);
  };

  const executeAction = async (action: ActionConfig) => {
    setIsProcessing(action.key);
    setConfirmAction(null);

    try {
      await action.handler(build);
      onAction?.(build, action.key);

      toast.success(`${action.label} was successful.`);
    } catch (error) {
      console.error(`Action ${action.key} failed:`, error);

      toast.error(`${action.label} failed. Please try again.`);
    } finally {
      setIsProcessing(null);
    }
  };

  const actions: ActionConfig[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      handler: (build) => {
        onAction?.(build, 'view');
      },
    },
    {
      key: 'console',
      label: 'Open Console',
      icon: <ExternalLink className="h-4 w-4" />,
      requiresStatus: ['queued', 'building', 'completed', 'failed'],
      handler: (build) => {
        if (build.consoleUrl) {
          window.open(build.consoleUrl, '_blank');
        } else {
          throw new Error('Console URL not available');
        }
      },
    },
    {
      key: 'download',
      label: 'Download Artifact',
      icon: <Download className="h-4 w-4" />,
      requiresRole: ['admin', 'manager'],
      requiresStatus: ['completed'],
      handler: (build) => {
        onAction?.(build, 'download');
      },
    },
    {
      key: 'retry',
      label: 'Retry Build',
      icon: <RefreshCw className="h-4 w-4" />,
      requiresRole: ['admin', 'manager'],
      requiresStatus: ['failed', 'cancelled'],
      confirm: {
        title: 'Retry Build',
        description:
          'Are you sure you want to retry this build? This will create a new build with the same configuration.',
      },
      handler: (build) => {
        onAction?.(build, 'retry');
      },
    },
    {
      key: 'cancel',
      label: 'Cancel Build',
      icon: <Square className="h-4 w-4" />,
      requiresRole: ['admin', 'manager'],
      requiresStatus: ['queued', 'building'],
      confirm: {
        title: 'Cancel Build',
        description:
          'Are you sure you want to cancel this build? This action cannot be undone.',
        confirmText: 'Cancel Build',
      },
      handler: (build) => {
        onAction?.(build, 'cancel');
      },
    },
    {
      key: 'compare',
      label: 'Compare Build',
      icon: <GitCompare className="h-4 w-4" />,
      handler: (build) => {
        onAction?.(build, 'compare');
      },
    },
    {
      key: 'copy-id',
      label: 'Copy Build ID',
      icon: <Copy className="h-4 w-4" />,
      handler: (build) => {
         navigator.clipboard.writeText(build.id);
         toast.success('Build ID copied to clipboard.');
      },
    },
    {
      key: 'copy-console-url',
      label: 'Copy Console URL',
      icon: <Copy className="h-4 w-4" />,
      requiresStatus: ['queued', 'building', 'completed', 'failed'],
      handler: (build) => {
        if (build.consoleUrl) {
           navigator.clipboard.writeText(build.consoleUrl);
           toast.success('Console URL copied to clipboard.');
        } else {
          throw new Error('Console URL not available');
        }
      },
    },
    {
      key: 'delete',
      label: 'Delete Build',
      icon: <Trash2 className="h-4 w-4" />,
      requiresRole: ['admin'],
      requiresStatus: ['failed', 'cancelled'],
      confirm: {
        title: 'Delete Build',
        description:
          'Are you sure you want to delete this build? This action cannot be undone.',
        confirmText: 'Delete',
      },
      handler: (build) => {
        onAction?.(build, 'delete');
      },
    },
  ];

  const availableActions = actions.filter((action) => {
    if (disabled) return false;
    if (action.requiresRole && !hasRole(action.requiresRole)) return false;
    if (action.requiresStatus && !hasStatus(action.requiresStatus))
      return false;
    return true;
  });

  const primaryActions = availableActions.slice(0, 3);
  const secondaryActions = availableActions.slice(3);

  return (
    <>
      {/* Primary actions */}
      <div className="flex items-center space-x-1">
        {primaryActions.map((action) => (
          <Button
            key={action.key}
            variant={variant}
            size={size}
            disabled={isProcessing === action.key}
            onClick={() => handleAction(action)}
            className="flex items-center space-x-1"
          >
            {action.icon}
            {showLabels && <span>{action.label}</span>}
          </Button>
        ))}

        {/* More actions dropdown */}
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={variant} size={size} disabled={disabled}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {secondaryActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onClick={() => handleAction(action)}
                  disabled={isProcessing === action.key}
                >
                  <div className="flex items-center space-x-2">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Build status badge */}
      <Badge
        variant={
          build.status === 'completed'
            ? 'default'
            : build.status === 'failed'
              ? 'destructive'
              : build.status === 'building'
                ? 'default'
                : 'secondary'
        }
      >
        {build.status.toUpperCase()}
      </Badge>

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>{confirmAction?.confirm?.title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {confirmAction?.confirm?.confirmText || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Compact version for use in tables
export function CompactBuildActions({
  build,
  onAction,
}: {
  build: MobileAppBuild;
  onAction?: (build: MobileAppBuild, action: string) => void;
}) {
  const { user } = useAuth();

  const hasPermission = (action: string) => {
    switch (action) {
      case 'download':
        return (
          ['admin', 'manager'].includes(user?.role || '') &&
          build.status === 'completed'
        );
      case 'console':
        return (
          ['queued', 'building', 'completed', 'failed'].includes(
            build.status,
          ) && !!build.consoleUrl
        );
      case 'retry':
        return (
          ['admin', 'manager'].includes(user?.role || '') &&
          ['failed', 'cancelled'].includes(build.status)
        );
      case 'cancel':
        return (
          ['admin', 'manager'].includes(user?.role || '') &&
          ['queued', 'building'].includes(build.status)
        );
      default:
        return true;
    }
  };

  return (
    <div className="flex space-x-1">
      {build.consoleUrl && hasPermission('console') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(build.consoleUrl, '_blank')}
        >
          Console
        </Button>
      )}
      {hasPermission('download') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction?.(build, 'download')}
        >
          Download
        </Button>
      )}
      <BuildActionButtons
        build={build}
        onAction={onAction}
        size="sm"
        variant="ghost"
      />
    </div>
  );
}
