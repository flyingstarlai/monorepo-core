/**
 * Version comparison utilities for semantic versioning
 */

export interface VersionStatus {
  status: 'latest' | 'outdated' | 'critical' | 'unknown';
  variant: 'success' | 'secondary' | 'destructive';
  versionsBehind?: number;
}

/**
 * Compare two semantic version strings
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map((part) => {
    const num = parseInt(part, 10);
    return isNaN(num) ? part : num;
  });

  const v2Parts = version2.split('.').map((part) => {
    const num = parseInt(part, 10);
    return isNaN(num) ? part : num;
  });

  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] ?? 0;
    const v2Part = v2Parts[i] ?? 0;

    if (typeof v1Part === 'number' && typeof v2Part === 'number') {
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    } else {
      // Fallback to string comparison for non-numeric parts
      const comparison = String(v1Part).localeCompare(String(v2Part));
      if (comparison !== 0) return comparison;
    }
  }

  return 0;
}

/**
 * Get version status compared to latest version
 */
export function getVersionStatus(
  currentVersion: string | null,
  latestVersion: string,
): VersionStatus {
  if (!currentVersion) {
    return {
      status: 'unknown',
      variant: 'secondary',
    };
  }

  const comparison = compareVersions(currentVersion, latestVersion);

  if (comparison === 0) {
    return {
      status: 'latest',
      variant: 'success',
      versionsBehind: 0,
    };
  }

  if (comparison < 0) {
    // Calculate how many versions behind (simplified)
    const currentParts = currentVersion.split('.').map(Number);
    const latestParts = latestVersion.split('.').map(Number);
    const versionsBehind = Math.max(
      (latestParts[0] || 0) - (currentParts[0] || 0),
      0,
    );

    if (versionsBehind >= 1) {
      return {
        status: 'critical',
        variant: 'destructive',
        versionsBehind,
      };
    } else {
      return {
        status: 'outdated',
        variant: 'secondary', // Use secondary instead of warning since it's not available
        versionsBehind,
      };
    }
  }

  // This shouldn't happen in normal usage (current > latest)
  return {
    status: 'unknown',
    variant: 'secondary',
  };
}

/**
 * Get the latest version from an array of apps
 */
export function getLatestVersion(
  apps: { latestVersion: string | null }[],
): string {
  const versions = apps
    .map((app) => app.latestVersion)
    .filter((version): version is string => version !== null);

  if (versions.length === 0) return '0.0.0';

  return versions.reduce((latest, current) => {
    return compareVersions(current, latest) > 0 ? current : latest;
  });
}

/**
 * Get the actual latest version from an array of apps (using actualLatestVersion)
 */
export function getActualLatestVersion(
  apps: { actualLatestVersion: string | null }[],
): string {
  const versions = apps
    .map((app) => app.actualLatestVersion)
    .filter((version): version is string => version !== null);

  if (versions.length === 0) return '0.0.0';

  return versions.reduce((latest, current) => {
    return compareVersions(current, latest) > 0 ? current : latest;
  });
}
