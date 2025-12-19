import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Server,
  RotateCcw,
  Save,
  Settings,
  Activity,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const Route = createFileRoute('/_authenticated/app-builder/settings')({
  component: AppBuilderSettings,
});

function AppBuilderSettings() {
  const [buildTimeout, setBuildTimeout] = useState('30');
  const [maxConcurrentBuilds, setMaxConcurrentBuilds] = useState('3');
  const [autoRetry, setAutoRetry] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [logLevel, setLogLevel] = useState('info');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">App Builder Settings</h1>
          <p className="text-muted-foreground">
            Configure your app builder build preferences and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Build Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Build Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="build-timeout">Build Timeout (minutes)</Label>
              <Input
                id="build-timeout"
                type="number"
                value={buildTimeout}
                onChange={(e) => setBuildTimeout(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-builds">Max Concurrent Builds</Label>
              <Input
                id="max-builds"
                type="number"
                value={maxConcurrentBuilds}
                onChange={(e) => setMaxConcurrentBuilds(e.target.value)}
                placeholder="3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-level">Log Level</Label>
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Build Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when builds complete or fail
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Retry Failed Builds</Label>
              <p className="text-sm text-muted-foreground">
                Automatically retry builds that fail due to transient errors
              </p>
            </div>
            <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Jenkins: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">MinIO: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Queue: 2 jobs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
