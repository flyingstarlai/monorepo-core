import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
// Simple replacements for missing components
const CollapsibleContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

const CollapsibleTrigger = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);
import { Separator } from '../../../components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Terminal,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { MobileAppBuild } from '../types';
import { toast } from 'sonner';

interface BuildErrorDisplayProps {
  build: MobileAppBuild;
  onRetry?: (build: MobileAppBuild) => void;
  onViewFullLog?: (build: MobileAppBuild) => void;
}

interface ErrorDetail {
  type: 'compilation' | 'test' | 'deployment' | 'infrastructure' | 'unknown';
  stage?: string;
  message: string;
  snippet?: string;
  line?: number;
  file?: string;
  timestamp?: string;
}

interface ErrorAnalysis {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestions: string[];
  relatedDocs?: string[];
}

function parseErrorDetails(errorMessage?: string): ErrorDetail | null {
  if (!errorMessage) return null;

  // Try to categorize the error based on common patterns
  if (
    errorMessage.includes('Gradle') ||
    errorMessage.includes('BUILD FAILED') ||
    errorMessage.includes('Compilation failed')
  ) {
    return {
      type: 'compilation',
      message: errorMessage,
      stage: 'Build',
      timestamp: new Date().toISOString(),
    };
  }

  if (errorMessage.includes('Test') || errorMessage.includes('FAILED')) {
    return {
      type: 'test',
      message: errorMessage,
      stage: 'Test',
      timestamp: new Date().toISOString(),
    };
  }

  if (errorMessage.includes('Deployment') || errorMessage.includes('Upload')) {
    return {
      type: 'deployment',
      message: errorMessage,
      stage: 'Deploy',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    type: 'unknown',
    message: errorMessage,
    stage: 'Unknown',
    timestamp: new Date().toISOString(),
  };
}

function analyzeError(error: ErrorDetail): ErrorAnalysis {
  const { type, message } = error;

  switch (type) {
    case 'compilation':
      if (message.includes('Out of memory')) {
        return {
          category: 'Memory Issue',
          severity: 'high',
          description: 'The build ran out of memory during compilation.',
          suggestions: [
            'Increase JVM heap size in gradle.properties',
            'Check for memory leaks in your code',
            'Reduce build parallelism if enabled',
          ],
          relatedDocs: [
            'Gradle Memory Configuration',
            'Android Build Performance',
          ],
        };
      }

      if (
        message.includes('dependency') ||
        message.includes('Could not resolve')
      ) {
        return {
          category: 'Dependency Resolution',
          severity: 'medium',
          description: 'Failed to resolve one or more dependencies.',
          suggestions: [
            'Check your internet connection',
            'Verify dependency versions in build.gradle',
            'Clear Gradle cache and retry',
            'Check repository configuration',
          ],
          relatedDocs: ['Gradle Dependencies', 'Android Build Configuration'],
        };
      }

      return {
        category: 'Compilation Error',
        severity: 'high',
        description:
          'The source code failed to compile due to syntax or semantic errors.',
        suggestions: [
          'Review the error messages for specific file and line information',
          'Check for syntax errors in the mentioned files',
          'Verify all imports and dependencies',
          'Run a clean build: ./gradlew clean build',
        ],
        relatedDocs: ['Kotlin Compilation Errors', 'Java Compilation Errors'],
      };

    case 'test':
      return {
        category: 'Test Failure',
        severity: 'medium',
        description: 'One or more tests failed during execution.',
        suggestions: [
          'Review the test failure output for specific assertion errors',
          'Check if the test environment is properly configured',
          'Verify test data and mock objects',
          'Run specific failing test locally for debugging',
        ],
        relatedDocs: ['Android Testing', 'JUnit Test Results'],
      };

    case 'deployment':
      if (message.includes('MinIO') || message.includes('S3')) {
        return {
          category: 'Storage Upload Error',
          severity: 'high',
          description: 'Failed to upload the build artifact to storage.',
          suggestions: [
            'Check storage service connectivity',
            'Verify storage credentials and permissions',
            'Check available storage space',
            'Retry the upload if it was a network issue',
          ],
          relatedDocs: ['MinIO Configuration', 'AWS S3 Upload'],
        };
      }

      return {
        category: 'Deployment Error',
        severity: 'high',
        description: 'Failed to deploy the application or upload artifacts.',
        suggestions: [
          'Check deployment configuration',
          'Verify target server accessibility',
          'Review deployment logs for specific errors',
          'Check resource constraints on target server',
        ],
        relatedDocs: ['Android App Deployment', 'Continuous Integration'],
      };

    default:
      return {
        category: 'Unknown Error',
        severity: 'medium',
        description: 'An unexpected error occurred during the build process.',
        suggestions: [
          'Review the complete build logs',
          'Check Jenkins configuration and connectivity',
          'Verify build environment and dependencies',
          'Contact support if the error persists',
        ],
        relatedDocs: ['Troubleshooting Builds', 'Jenkins Configuration'],
      };
  }
}

function ErrorSeverityBadge({ severity }: { severity: string }) {
  const variants = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive',
    critical: 'destructive',
  } as const;

  const colors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  } as const;

  return (
    <Badge
      variant={variants[severity as keyof typeof variants] || 'secondary'}
      className={colors[severity as keyof typeof colors]}
    >
      {severity.toUpperCase()}
    </Badge>
  );
}

function ErrorSuggestionList({
  suggestions,
  relatedDocs,
}: {
  suggestions: string[];
  relatedDocs?: string[];
}) {
  const [showRelated, setShowRelated] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Suggested Actions:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-muted-foreground">
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {relatedDocs && relatedDocs.length > 0 && (
        <div>
          <CollapsibleTrigger
            onClick={() => setShowRelated(!showRelated)}
            className="flex items-center space-x-1"
          >
            <span className="text-sm">Related Documentation</span>
            {showRelated ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1">
              {relatedDocs.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                >
                  <FileText className="h-3 w-3" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      )}
    </div>
  );
}

export function BuildErrorDisplay({
  build,
  onRetry,
  onViewFullLog,
}: BuildErrorDisplayProps) {
  const [activeTab, setActiveTab] = useState('error');
  const [expandedSnippet, setExpandedSnippet] = useState(false);

  if (!build.errorMessage && build.status !== 'failed') {
    return null;
  }

  const errorDetail = parseErrorDetails(build.errorMessage);
  const errorAnalysis = errorDetail ? analyzeError(errorDetail) : null;

  const copyErrorToClipboard = () => {
    if (build.errorMessage) {
      navigator.clipboard.writeText(build.errorMessage);
      toast.success('Error message copied to clipboard.');
    }
  };

  const copyBuildId = () => {
    navigator.clipboard.writeText(build.id);
    toast.success('Build ID copied to clipboard.');
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Build Failed</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">{build.status.toUpperCase()}</Badge>
            <Button variant="outline" size="sm" onClick={copyBuildId}>
              Copy Build ID
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Build {build.id.slice(-8)} failed on{' '}
          {new Date(build.updatedAt).toLocaleString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Analysis */}
        {errorAnalysis && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">
                  {errorAnalysis.category}
                </h3>
                <ErrorSeverityBadge severity={errorAnalysis.severity} />
              </div>
            </div>

            <p className="text-muted-foreground">{errorAnalysis.description}</p>

            <ErrorSuggestionList
              suggestions={errorAnalysis.suggestions}
              relatedDocs={errorAnalysis.relatedDocs}
            />
          </div>
        )}

        {/* Error Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="error" className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>Error Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="flex items-center space-x-1"
            >
              <Terminal className="h-4 w-4" />
              <span>Actions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="error" className="space-y-4">
            {build.errorMessage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Error Message</h4>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSnippet(!expandedSnippet)}
                    >
                      {expandedSnippet ? 'Collapse' : 'Expand'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyErrorToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-48 w-full rounded-md border overflow-auto p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {build.errorMessage}
                  </pre>
                </div>
              </div>
            )}

            {errorDetail && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Error Type:</span>
                  <p className="text-muted-foreground capitalize">
                    {errorDetail.type}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Stage:</span>
                  <p className="text-muted-foreground">
                    {errorDetail.stage || 'Unknown'}
                  </p>
                </div>
                {errorDetail.file && (
                  <div>
                    <span className="font-medium">File:</span>
                    <p className="text-muted-foreground font-mono">
                      {errorDetail.file}
                    </p>
                  </div>
                )}
                {errorDetail.line && (
                  <div>
                    <span className="font-medium">Line:</span>
                    <p className="text-muted-foreground">{errorDetail.line}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Actions</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {onRetry && (
                  <Button onClick={() => onRetry(build)} className="w-full">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Retry Build
                  </Button>
                )}

                {build.consoleUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(build.consoleUrl, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Console
                  </Button>
                )}

                {onViewFullLog && (
                  <Button
                    variant="outline"
                    onClick={() => onViewFullLog(build)}
                    className="w-full"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    View Full Log
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={copyErrorToClipboard}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Error
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Build Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Build ID:</span>
                  <p className="text-muted-foreground font-mono">
                    {build.id.slice(-8)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-muted-foreground">{build.status}</p>
                </div>
                <div>
                  <span className="font-medium">Started:</span>
                  <p className="text-muted-foreground">
                    {build.startedAt
                      ? new Date(build.startedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Failed:</span>
                  <p className="text-muted-foreground">
                    {build.completedAt
                      ? new Date(build.completedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Started By:</span>
                  <p className="text-muted-foreground">{build.startedBy}</p>
                </div>
                <div>
                  <span className="font-medium">Build Number:</span>
                  <p className="text-muted-foreground">
                    {build.jenkinsBuildNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
