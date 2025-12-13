# Real-time Jenkins Build Progress Documentation

## Overview

This document describes the implementation of real-time Jenkins build progress tracking in the mobile app builder web application, transforming static build status into an interactive, live-updated user experience.

## Problem Statement

### Current Limitations

- Users trigger builds but cannot see real-time progress
- Build status only updates every 30 seconds via polling
- No visibility into build stages (checkout, compile, upload)
- No access to live build logs during execution
- No estimated completion time
- Poor user experience during long-running builds

### User Experience Gap

```
User: "I triggered a build 10 minutes ago, is it working?"
System: "Status shows 'building' but no progress details"
User: "What stage is it in? How much longer?"
System: "Check back in 30 seconds for an update"
```

## Solution Architecture

### High-Level Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI      │◄──►│   API Gateway    │◄──►│   Jenkins       │
│  (React)       │    │  (NestJS)      │    │  (External)     │
│                │    │                 │    │                 │
│ • Progress Bar  │    │ • WebSocket     │    │ • Job Status    │
│ • Stage Indicators│    │ • Smart Polling  │    │ • Log Streaming  │
│ • Live Logs     │    │ • Caching       │    │ • Build Triggers │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Action**: Trigger build from web UI
2. **API Response**: Create build record, trigger Jenkins job
3. **Real-time Updates**: WebSocket + adaptive polling
4. **Progress Display**: Stage-based visualization
5. **Completion**: Artifact download and notification

## Implementation Details

### Backend Enhancements

#### 1. Enhanced Build Progress Endpoint

**New API Route**: `GET /app-builder/builds/:id/progress`

```typescript
interface BuildProgress {
  id: string;
  status: 'queued' | 'building' | 'completed' | 'failed';
  stage: 'checkout' | 'compile' | 'upload' | 'complete' | 'error';
  progress: number; // 0-100 percentage
  currentStep: string; // e.g., "Compiling Kotlin code..."
  totalSteps: string[];
  estimatedTimeRemaining?: number; // seconds
  logs: {
    recent: string[]; // last 50 lines
    summary: {
      errors: number;
      warnings: number;
      info: number;
    };
  };
  jenkinsData: {
    queueId: number;
    buildNumber?: number;
    consoleUrl: string;
    timestamp: number;
  };
}
```

#### 2. Smart Polling Service

**Adaptive Polling Strategy**:

```typescript
const POLLING_INTERVALS = {
  queued: 2000, // Fast updates for queue
  building: 1000, // Real-time during build
  completed: 10000, // Slow down when done
  failed: 5000, // Check for recovery
};

class BuildProgressService {
  async startProgressTracking(buildId: string) {
    const poll = async () => {
      const progress = await this.getProgressFromJenkins(buildId);
      this.broadcastProgress(buildId, progress);

      // Adaptive polling interval
      const interval = POLLING_INTERVALS[progress.status];
      this.scheduleNextPoll(interval);
    };

    poll();
  }
}
```

#### 3. Jenkins Log Parsing

**Stage Detection Algorithm**:

```typescript
const STAGE_PATTERNS = {
  checkout: [/^> Task :checkout/, /^Cloning repository/, /^git checkout/],
  compile: [
    /^> Task :compileDebugKotlin/,
    /^> Task :assembleRelease/,
    /^Gradle build/,
  ],
  upload: [/^Uploading.*to MinIO/, /^mc cp.*minio\//, /^Archiving artifacts/],
  error: [/^FAILED/, /^ERROR/, /^Exception/, /^Build failed/],
};

class JenkinsLogParser {
  parseProgress(logLine: string): ProgressUpdate | null {
    for (const [stage, patterns] of Object.entries(STAGE_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(logLine))) {
        return { stage, detected: true, logLine };
      }
    }
    return null;
  }

  calculateProgress(buildLogs: string[]): number {
    const totalStages = ['checkout', 'compile', 'upload'];
    const completedStages = totalStages.filter((stage) =>
      buildLogs.some((log) =>
        STAGE_PATTERNS[stage].some((pattern) => pattern.test(log)),
      ),
    );
    return Math.round((completedStages.length / totalStages.length) * 100);
  }
}
```

#### 4. WebSocket Integration

**Real-time Communication**:

```typescript
class BuildWebSocketService {
  private connections: Map<string, WebSocket[]> = new Map();

  subscribeToBuild(buildId: string, ws: WebSocket) {
    if (!this.connections.has(buildId)) {
      this.connections.set(buildId, []);
    }
    this.connections.get(buildId)!.push(ws);

    // Send initial state
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        buildId,
        timestamp: Date.now(),
      }),
    );
  }

  broadcastProgress(buildId: string, progress: BuildProgress) {
    const connections = this.connections.get(buildId) || [];
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'progress',
            data: progress,
            timestamp: Date.now(),
          }),
        );
      }
    });
  }
}
```

### Frontend Components

#### 1. Build Progress Modal

**Main Progress Interface**:

```typescript
const BuildProgressModal: React.FC<BuildProgressModalProps> = ({
  buildId,
  isOpen,
  onClose
}) => {
  const [progress, setProgress] = useState<BuildProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (isOpen && buildId) {
      const ws = new WebSocket(`${WS_BASE_URL}/builds/${buildId}`);

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'progress') {
          setProgress(message.data);
        } else if (message.type === 'logs') {
          setLogs(prev => [...prev.slice(-100), message.data]);
        }
      };

      return () => ws.close();
    }
  }, [isOpen, buildId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Build Progress</DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(progress?.status)}>
              {progress?.status}
            </Badge>
            {progress?.estimatedTimeRemaining && (
              <span className="text-sm text-muted-foreground">
                ~{formatDuration(progress.estimatedTimeRemaining)} remaining
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          {/* Progress Visualization */}
          <div className="col-span-2">
            <BuildProgressBar progress={progress} />
            <StageIndicators
              stages={progress?.totalSteps || []}
              currentStage={progress?.stage}
            />
          </div>

          {/* Build Metrics */}
          <div className="space-y-4">
            <BuildMetricsCard progress={progress} />
            <BuildActions buildId={buildId} status={progress?.status} />
          </div>
        </div>

        {/* Live Logs */}
        <BuildLogsViewer
          logs={logs}
          autoScroll={autoScroll}
          onToggleScroll={setAutoScroll}
        />
      </DialogContent>
    </Dialog>
  );
};
```

#### 2. Progress Bar Component

**Visual Progress Indicator**:

```typescript
const BuildProgressBar: React.FC<BuildProgressBarProps> = ({ progress }) => {
  const percentage = progress?.progress || 0;
  const statusColor = {
    queued: 'bg-yellow-500',
    building: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  }[progress?.status || 'queued'];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Build Progress</span>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${statusColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {progress?.currentStep && (
        <p className="text-sm text-muted-foreground italic">
          {progress.currentStep}
        </p>
      )}
    </div>
  );
};
```

#### 3. Stage Indicators Component

**Build Stage Visualization**:

```typescript
const stageConfig = {
  'checkout': { icon: '📥', label: 'Source Code Checkout' },
  'compile': { icon: '🔨', label: 'Building Application' },
  'upload': { icon: '📤', label: 'Uploading Artifacts' },
  'complete': { icon: '✅', label: 'Build Complete' },
  'error': { icon: '❌', label: 'Build Failed' }
};

const StageIndicators: React.FC<StageIndicatorsProps> = ({ stages, currentStage }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Build Stages</h4>
      {stages.map((stage, index) => {
        const config = stageConfig[stage] || stageConfig.error;
        const isCompleted = stages.indexOf(currentStage) > index;
        const isCurrent = stage === currentStage;

        return (
          <div
            key={stage}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isCompleted ? 'bg-green-50 border-green-200' :
              isCurrent ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <span className="text-xl">{config.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground capitalize">{stage}</p>
            </div>
            {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
            {isCurrent && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
          </div>
        );
      })}
    </div>
  );
};
```

#### 4. Live Log Viewer

**Real-time Log Display**:

```typescript
const BuildLogsViewer: React.FC<BuildLogsViewerProps> = ({
  logs,
  autoScroll,
  onToggleScroll
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLogLevel = (logLine: string): 'error' | 'warning' | 'info' => {
    if (/ERROR|FAILED|Exception/i.test(logLine)) return 'error';
    if (/WARNING|WARN/i.test(logLine)) return 'warning';
    return 'info';
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Build Logs</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleScroll(!autoScroll)}
        >
          {autoScroll ? 'Pause Auto-scroll' : 'Resume Auto-scroll'}
        </Button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto"
           ref={logsEndRef}>
        {logs.map((log, index) => {
          const level = getLogLevel(log);
          return (
            <div key={index} className={`whitespace-pre-wrap break-words ${getLogColor(level)}`}>
              <span className="text-gray-500 mr-2">[{timestamp()}]</span>
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

## Integration Guide

### Backend Setup

#### 1. Add New API Endpoints

**File**: `apps/api/src/app-builder/controllers/app-builder.controller.ts`

```typescript
@Get('builds/:id/progress')
@ApiOperation({ summary: 'Get real-time build progress' })
async getBuildProgress(@Param('id') id: string) {
  const build = await this.mobileAppBuildService.findById(id);
  if (!build) {
    throw new Error('Build not found');
  }

  // Get live progress from Jenkins or cache
  const progress = await this.jenkinsService.getBuildProgress(build.jenkinsQueueId);

  return {
    ...progress,
    id: build.id,
    status: build.status,
    jenkinsData: {
      queueId: build.jenkinsQueueId,
      buildNumber: build.jenkinsBuildNumber,
      consoleUrl: build.consoleUrl,
      timestamp: build.startedAt?.getTime() || Date.now()
    }
  };
}

@Get('builds/:id/logs')
@ApiOperation({ summary: 'Get live build logs' })
async getBuildLogs(@Param('id') id: string, @Query('fromLine') fromLine?: number) {
  const build = await this.mobileAppBuildService.findById(id);
  if (!build) {
    throw new Error('Build not found');
  }

  const logs = await this.jenkinsService.getBuildLogs(build.jenkinsQueueId, fromLine);

  return {
    logs,
    hasMore: logs.length >= 50,
    totalLines: build.totalLogLines || 0,
    fromLine: fromLine || 0
  };
}
```

#### 2. WebSocket Gateway

**File**: `apps/api/src/app-builder/gateways/build-websocket.gateway.ts`

```typescript
@WebSocketGateway({
  namespace: 'builds',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  },
})
export class BuildWebSocketGateway implements OnGateway, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private connections: Map<string, Socket[]> = new Map();

  handleConnection(client: Socket, ...args: string[]) {
    const [buildId] = args;
    console.log(`Client connected to build ${buildId}`);

    if (!this.connections.has(buildId)) {
      this.connections.set(buildId, []);
    }
    this.connections.get(buildId)!.push(client);

    // Send current progress if available
    this.sendCurrentProgress(buildId, client);
  }

  handleDisconnect(client: Socket) {
    // Remove connection from all build rooms
    for (const [buildId, connections] of this.connections.entries()) {
      const index = connections.indexOf(client);
      if (index > -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.connections.delete(buildId);
        }
        break;
      }
    }
  }

  private async sendCurrentProgress(buildId: string, client: Socket) {
    try {
      const progress = await this.getBuildProgress(buildId);
      client.emit('progress', progress);
    } catch (error) {
      console.error('Failed to send progress:', error);
    }
  }
}
```

### Frontend Setup

#### 1. Update Build Service

**File**: `apps/web/src/lib/app-builder.service.ts`

```typescript
const mobileAppBuilderService = {
  // ... existing methods ...

  async getBuildProgress(id: string): Promise<BuildProgress> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<BuildProgress>(
      `/app-builder/builds/${id}/progress`,
    );
    return res.data;
  },

  async getBuildLogs(
    id: string,
    fromLine?: number,
  ): Promise<BuildLogsResponse> {
    const { apiClient } = await import('./api-client');
    const params = fromLine ? { fromLine } : undefined;
    const res = await apiClient.get<BuildLogsResponse>(
      `/app-builder/builds/${id}/logs`,
      { params },
    );
    return res.data;
  },

  subscribeToBuildProgress(
    buildId: string,
    callbacks: {
      onProgress: (progress: BuildProgress) => void;
      onLogs: (logs: string[]) => void;
    },
  ) {
    const ws = new WebSocket(`${WS_BASE_URL}/builds/${buildId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'progress') {
        callbacks.onProgress(message.data);
      } else if (message.type === 'logs') {
        callbacks.onLogs(message.data);
      }
    };

    return () => ws.close();
  },
};
```

#### 2. Update Build History Page

**File**: `apps/web/src/features/app-builder/pages/app-builder.index.tsx`

```typescript
const AppBuilderPage: React.FC = () => {
  const [selectedBuildId, setSelectedBuildId] = useState<string>('');
  const [showProgress, setShowProgress] = useState(false);

  const { data: builds, isLoading } = useBuilds();

  const handleViewProgress = (buildId: string) => {
    setSelectedBuildId(buildId);
    setShowProgress(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Existing build history table */}
      <BuildHistoryTable
        builds={builds}
        onViewProgress={handleViewProgress}
        isLoading={isLoading}
      />

      {/* Progress modal */}
      {showProgress && (
        <BuildProgressModal
          buildId={selectedBuildId}
          isOpen={showProgress}
          onClose={() => setShowProgress(false)}
        />
      )}
    </div>
  );
};
```

## Performance Considerations

### Backend Optimization

#### 1. Caching Strategy

```typescript
// Redis caching for build progress
class BuildProgressCache {
  async cacheProgress(buildId: string, progress: BuildProgress) {
    const key = `build:progress:${buildId}`;
    await this.redis.setex(key, 300, JSON.stringify(progress)); // 5 minutes
  }

  async getCachedProgress(buildId: string): Promise<BuildProgress | null> {
    const cached = await this.redis.get(`build:progress:${buildId}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

#### 2. Connection Management

```typescript
// WebSocket connection pooling
class ConnectionPool {
  private connections: Map<string, WebSocket[]> = new Map();
  private maxConnections = 10;

  addConnection(buildId: string, ws: WebSocket): boolean {
    const connections = this.connections.get(buildId) || [];
    if (connections.length >= this.maxConnections) {
      return false; // Connection limit reached
    }
    connections.push(ws);
    return true;
  }
}
```

### Frontend Optimization

#### 1. Component Memoization

```typescript
const BuildProgressBar = React.memo<BuildProgressBarProps>(({ progress }) => {
  // Memoize to prevent unnecessary re-renders
  const percentage = progress?.progress || 0;
  const statusColor = getStatusColor(progress?.status);

  return (
    <div className="space-y-2">
      {/* Progress bar implementation */}
    </div>
  );
});
```

#### 2. Virtual Scrolling for Logs

```typescript
const VirtualizedLogViewer = ({ logs }: { logs: string[] }) => {
  // Only render visible log lines for performance
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });

  return (
    <div className="h-96 overflow-auto">
      {logs.slice(visibleRange.start, visibleRange.end).map((log, index) => (
        <LogLine key={visibleRange.start + index} log={log} />
      ))}
    </div>
  );
};
```

## Testing Strategy

### Unit Tests

#### Backend Tests

```typescript
describe('BuildProgressService', () => {
  describe('parseProgress', () => {
    it('should detect checkout stage', () => {
      const logLine = '> Task :checkout';
      const result = service.parseProgress(logLine);
      expect(result.stage).toBe('checkout');
    });

    it('should calculate progress correctly', () => {
      const logs = [
        '> Task :checkout',
        '> Task :compileDebugKotlin',
        '> Task :assembleRelease',
      ];
      const progress = service.calculateProgress(logs);
      expect(progress).toBe(67); // 2/3 stages completed
    });
  });
});
```

#### Frontend Tests

```typescript
describe('BuildProgressBar', () => {
  it('should display correct percentage', () => {
    const progress = { progress: 75, status: 'building' };
    render(<BuildProgressBar progress={progress} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('should show correct status color', () => {
    const progress = { progress: 50, status: 'building' };
    render(<BuildProgressBar progress={progress} />);

    const bar = screen.getByTestId('progress-bar');
    expect(bar).toHaveClass('bg-blue-500');
  });
});
```

### Integration Tests

#### E2E Test Scenario

```typescript
describe('Build Progress Flow', () => {
  it('should show real-time progress from trigger to completion', async () => {
    // 1. Trigger build
    await page.goto('/app-builder');
    await page.click('[data-testid="trigger-build-button"]');

    // 2. Check progress modal opens
    await expect(
      page.locator('[data-testid="build-progress-modal"]'),
    ).toBeVisible();

    // 3. Verify stage indicators
    await expect(page.locator('[data-testid="stage-checkout"]')).toBeVisible();

    // 4. Wait for progress updates
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute(
      'aria-valuenow',
      '50',
    );

    // 5. Verify completion
    await expect(page.locator('[data-testid="stage-complete"]')).toBeVisible();
  });
});
```

## Deployment Guide

### Environment Variables

Add to `.env.example`:

```bash
# WebSocket Configuration
WS_BASE_URL=ws://localhost:3001

# Build Progress Configuration
BUILD_PROGRESS_CACHE_TTL=300
BUILD_LOGS_MAX_LINES=1000
BUILD_MAX_CONNECTIONS_PER_BUILD=10
```

### Docker Configuration

Update `docker-compose.yml` for WebSocket support:

```yaml
services:
  api:
    environment:
      - WS_PORT=3001
    ports:
      - '3001:3001' # WebSocket port
```

## Monitoring and Analytics

### Key Metrics

- WebSocket connection success rate
- Average message latency
- Build progress update frequency
- User engagement with progress features
- Build completion time accuracy

### Health Checks

```typescript
// WebSocket health monitoring
@Get('health/websocket')
async checkWebSocketHealth() {
  return {
    status: 'healthy',
    activeConnections: this.getActiveConnections(),
    uptime: process.uptime(),
    lastActivity: this.getLastActivity()
  };
}
```

## Security Considerations

### WebSocket Security

- Origin validation for WebSocket connections
- Rate limiting for connection attempts
- Authentication for WebSocket access
- Input sanitization for log data

### Data Protection

- No sensitive data in WebSocket messages
- Secure transmission (WSS in production)
- Access control for build logs
- Audit logging for progress access

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check firewall settings
   - Verify WebSocket port is open
   - Confirm CORS configuration

2. **Progress Not Updating**
   - Verify Jenkins job is running
   - Check API polling logic
   - Review cache invalidation

3. **High Memory Usage**
   - Implement log circular buffering
   - Add connection limits
   - Optimize WebSocket message size

### Debug Tools

```typescript
// Debug logging for build progress
if (process.env.NODE_ENV === 'development') {
  console.log('Build Progress Update:', {
    buildId,
    progress: progress.progress,
    stage: progress.stage,
    timestamp: new Date().toISOString(),
  });
}
```

## Future Enhancements

### Phase 2 Features

- Build comparison between versions
- Historical build performance analytics
- Predictive build time estimates
- Mobile push notifications
- Build replay and debugging tools

### Scalability Considerations

- Redis cluster for distributed caching
- Load balancing for WebSocket servers
- Database optimization for high-volume builds
- CDN integration for log streaming

---

This comprehensive documentation provides the complete implementation plan for adding real-time Jenkins build progress to the mobile app builder, significantly improving the user experience during Android application builds.
