// Enhanced Cross-tab authentication synchronization utilities
// Based on TC-Studio's production-tested implementation
import type { User } from '@/features/users/types/user.types';
import { useAuthStore } from '@/features/auth/store';

export type AuthEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATE'
  | 'TOKEN_REFRESH';

export interface AuthEventData {
  user?: User;
  token?: string;
  refreshToken?: string;
  [key: string]: any;
}

export interface AuthEvent {
  event: AuthEventType;
  data?: AuthEventData;
  timestamp: number;
}

// Broadcast channel for real-time cross-tab communication
let authChannel: BroadcastChannel | null = null;

// Initialize broadcast channel with fallback
const getAuthChannel = (): BroadcastChannel | null => {
  if (authChannel) return authChannel;

  try {
    authChannel = new BroadcastChannel('auth_sync');
    return authChannel;
  } catch (error) {
    console.warn('BroadcastChannel not supported:', error);
    return null;
  }
};

// Broadcast authentication event to other tabs
export const broadcastAuthEvent = (
  event: AuthEventType,
  data?: AuthEventData,
): void => {
  const channel = getAuthChannel();
  const authEvent: AuthEvent = {
    event,
    data,
    timestamp: Date.now(),
  };

  // Try BroadcastChannel first (immediate)
  if (channel) {
    try {
      channel.postMessage(authEvent);
      return;
    } catch (error) {
      console.warn('Failed to broadcast via BroadcastChannel:', error);
    }
  }

  // Fallback to localStorage events (slower, but universal)
  try {
    localStorage.setItem('auth_sync_event', JSON.stringify(authEvent));
    // Remove immediately to trigger storage event in other tabs
    localStorage.removeItem('auth_sync_event');
  } catch (error) {
    console.warn('Failed to broadcast via localStorage:', error);
  }
};

// Listen to authentication events from other tabs
export const listenToAuthEvents = (
  callback: (event: AuthEventType, data?: AuthEventData) => void,
): (() => void) => {
  const channel = getAuthChannel();
  const processedEvents = new Set<string>();

  const handleBroadcastMessage = (event: MessageEvent) => {
    try {
      const authEvent = event.data as AuthEvent;

      // Prevent processing duplicate events
      const eventId = `${authEvent.event}_${authEvent.timestamp}`;
      if (processedEvents.has(eventId)) return;
      processedEvents.add(eventId);

      // Clean up old event IDs (keep last 100)
      if (processedEvents.size > 100) {
        const entries = Array.from(processedEvents);
        processedEvents.clear();
        entries.slice(-50).forEach((id) => processedEvents.add(id));
      }

      callback(authEvent.event, authEvent.data);
    } catch (error) {
      console.warn('Failed to process auth broadcast message:', error);
    }
  };

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'auth_sync_event' && event.newValue) {
      try {
        const authEvent = JSON.parse(event.newValue) as AuthEvent;

        // Prevent processing duplicate events
        const eventId = `${authEvent.event}_${authEvent.timestamp}`;
        if (processedEvents.has(eventId)) return;
        processedEvents.add(eventId);

        callback(authEvent.event, authEvent.data);
      } catch (error) {
        console.warn('Failed to parse auth storage event:', error);
      }
    }
  };

  // Subscribe to BroadcastChannel
  if (channel) {
    try {
      channel.addEventListener('message', handleBroadcastMessage);
    } catch (error) {
      console.warn('Failed to add BroadcastChannel listener:', error);
    }
  }

  // Subscribe to storage events (fallback)
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    if (channel) {
      try {
        channel.removeEventListener('message', handleBroadcastMessage);
      } catch (error) {
        console.warn('Failed to remove BroadcastChannel listener:', error);
      }
    }
    window.removeEventListener('storage', handleStorageChange);
    processedEvents.clear();
  };
};

// Monitor token changes across tabs
export const monitorTokenChanges = (
  onTokenChange: (token: string | null) => void,
): (() => void) => {
  let lastToken = useAuthStore.getState().token;

  const handleStoreChange = () => {
    const currentToken = useAuthStore.getState().token;
    if (currentToken !== lastToken) {
      lastToken = currentToken;
      onTokenChange(currentToken);
    }
  };

  // Subscribe to store changes
  const unsubscribe = useAuthStore.subscribe(handleStoreChange);

  return () => {
    unsubscribe();
  };
};

// Monitor refresh token changes
export const monitorRefreshTokenChanges = (
  onRefreshTokenChange: (refreshToken: string | null) => void,
): (() => void) => {
  let lastRefreshToken = useAuthStore.getState().refreshToken;

  const handleStoreChange = () => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;
    if (currentRefreshToken !== lastRefreshToken) {
      lastRefreshToken = currentRefreshToken;
      onRefreshTokenChange(currentRefreshToken);
    }
  };

  // Subscribe to store changes
  const unsubscribe = useAuthStore.subscribe(handleStoreChange);

  return () => {
    unsubscribe();
  };
};

// Synchronize authentication state across tabs
export const synchronizeAuthState = async (
  getCurrentState: () => {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
  },
  updateState: (
    user: User | null,
    token: string | null,
    refreshToken?: string | null,
  ) => void,
): Promise<() => void> => {
  // Get current store state
  const storeState = useAuthStore.getState();

  // Initial sync - check if store has different state than provided
  if (storeState.token && storeState.token !== getCurrentState().token) {
    // Store has token but current state doesn't, sync from store
    updateState(storeState.user, storeState.token, storeState.refreshToken);
  }

  // Set up ongoing synchronization
  const cleanupAuthEvents = listenToAuthEvents((event, data) => {
    switch (event) {
      case 'LOGIN':
        if (data?.user && data?.token) {
          updateState(data.user, data.token, data.refreshToken);
        }
        break;

      case 'LOGOUT':
        updateState(null, null, null);
        break;

      case 'PROFILE_UPDATE':
        if (data?.user) {
          updateState(
            data.user,
            getCurrentState().token,
            getCurrentState().refreshToken,
          );
        }
        break;

      case 'TOKEN_REFRESH':
        if (data?.token) {
          updateState(getCurrentState().user, data.token, data.refreshToken);
        }
        break;
    }
  });

  const cleanupTokenMonitor = monitorTokenChanges((token) => {
    if (token !== getCurrentState().token) {
      if (token) {
        // Token was added/updated, validate it
        fetch('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Token invalid');
            }
          })
          .then((user) => {
            updateState(user, token, useAuthStore.getState().refreshToken);
          })
          .catch(() => {
            useAuthStore.getState().clearAuth();
            updateState(null, null, null);
          });
      } else {
        // Token was removed
        updateState(null, null, null);
      }
    }
  });

  const cleanupRefreshTokenMonitor = monitorRefreshTokenChanges(
    (refreshToken) => {
      if (refreshToken !== getCurrentState().refreshToken) {
        updateState(
          getCurrentState().user,
          getCurrentState().token,
          refreshToken,
        );
      }
    },
  );

  return () => {
    cleanupAuthEvents();
    cleanupTokenMonitor();
    cleanupRefreshTokenMonitor();
  };
};

// Enhanced logout event dispatcher
export const dispatchLogoutEvent = (): void => {
  // Clear tokens via store
  useAuthStore.getState().clearAuth();

  // Dispatch custom event for global handling
  window.dispatchEvent(new CustomEvent('auth:logout'));

  // Broadcast to other tabs
  broadcastAuthEvent('LOGOUT');
};

// Enhanced login event dispatcher
export const dispatchLoginEvent = (
  user: User,
  token: string,
  refreshToken?: string,
): void => {
  // Store tokens via Zustand persist
  useAuthStore.getState().setUser(user);
  useAuthStore.setState({
    token,
    refreshToken: refreshToken || null,
    isAuthenticated: true,
  });

  // Broadcast to other tabs
  broadcastAuthEvent('LOGIN', { user, token, refreshToken });
};

// Enhanced profile update event dispatcher
export const dispatchProfileUpdateEvent = (user: User): void => {
  broadcastAuthEvent('PROFILE_UPDATE', { user });
};

// Enhanced token refresh event dispatcher
export const dispatchTokenRefreshEvent = (token: string): void => {
  useAuthStore.setState({ token });
  broadcastAuthEvent('TOKEN_REFRESH', { token });
};

// Utility to check if browser supports cross-tab features
export const checkCrossTabSupport = (): {
  broadcastChannel: boolean;
  localStorage: boolean;
  storageEvents: boolean;
} => {
  return {
    broadcastChannel: typeof BroadcastChannel !== 'undefined',
    localStorage:
      typeof Storage !== 'undefined' && typeof localStorage !== 'undefined',
    storageEvents: typeof StorageEvent !== 'undefined',
  };
};

// Debug utility to log cross-tab events
export const debugCrossTabEvents = (enabled: boolean = false): void => {
  if (!enabled) return;

  listenToAuthEvents((event, data) => {
    console.log(`[Cross-Tab] Auth event received:`, {
      event,
      data,
      timestamp: Date.now(),
    });
  });

  monitorTokenChanges((token) => {
    console.log(`[Cross-Tab] Token changed:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      timestamp: Date.now(),
    });
  });

  monitorRefreshTokenChanges((refreshToken) => {
    console.log(`[Cross-Tab] Refresh token changed`, {
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
      timestamp: Date.now(),
    });
  });
};
