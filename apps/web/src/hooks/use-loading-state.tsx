import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  timeout?: number; // Auto-disable loading after timeout (ms)
  onTimeout?: () => void;
}

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

interface UseLoadingStateReturn extends LoadingState {
  setLoading: (loading: boolean, message?: string) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

export function useLoadingState(
  options: UseLoadingStateOptions = {},
): UseLoadingStateReturn {
  const { initialLoading = false, timeout, onTimeout } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    message: undefined,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
  }, []);

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const setupTimeout = () => {
    if (timeout && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
        onTimeout?.();
      }, timeout);
    }
  };

  const setLoading = useCallback(
    (loading: boolean, message?: string) => {
      clearExistingTimeout();

      setState({
        isLoading: loading,
        message: loading ? message : undefined,
      });

      if (loading) {
        setupTimeout();
      }
    },
    [timeout, onTimeout],
  );

  const startLoading = useCallback(
    (message?: string) => {
      setLoading(true, message);
    },
    [setLoading],
  );

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
      try {
        startLoading(message);
        const result = await promise;
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return {
    isLoading: state.isLoading,
    message: state.message,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

// Global loading state using context
import { createContext, useContext } from 'react';

interface GlobalLoadingContextType {
  isLoading: boolean;
  message?: string;
  showGlobalLoader: (message?: string) => void;
  hideGlobalLoader: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | null>(
  null,
);

interface GlobalLoadingProviderProps {
  children: ReactNode;
}

export function GlobalLoadingProvider({
  children,
}: GlobalLoadingProviderProps) {
  const { isLoading, message, startLoading, stopLoading } = useLoadingState();

  const showGlobalLoader = (message?: string) => {
    startLoading(message);
  };

  const hideGlobalLoader = () => {
    stopLoading();
  };

  return (
    <GlobalLoadingContext.Provider
      value={{
        isLoading,
        message,
        showGlobalLoader,
        hideGlobalLoader,
      }}
    >
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoader(): GlobalLoadingContextType {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error(
      'useGlobalLoader must be used within a GlobalLoadingProvider',
    );
  }
  return context;
}

export default useLoadingState;
