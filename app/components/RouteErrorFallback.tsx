import { useRouteError, isRouteErrorResponse } from 'react-router';
import { useEffect } from 'react';

export function RouteErrorFallback() {
  const error = useRouteError();

  useEffect(() => {
    // Check if the error is related to dynamic import failure
    // This happens frequently on Vercel deployments when a chunk hash changes
    // and the user has an old version of the site loaded.
    const errorMessage = error instanceof Error ? error.message : '';
    const isChunkLoadError = 
      errorMessage.includes('error loading dynamically imported module') ||
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Importing a module script failed');

    if (isChunkLoadError) {
      // Force a hard reload to fetch the latest assets
      window.location.reload();
    }
  }, [error]);

  // General error fallback UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-xl shadow-lg p-8 text-center border border-[var(--border)]">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Oops! Something went wrong</h2>
        <p className="text-[var(--text-secondary)] mb-6 text-sm break-words">
          {isRouteErrorResponse(error) 
            ? `${error.status} ${error.statusText}`
            : error instanceof Error 
              ? error.message 
              : 'An unexpected error occurred'}
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors w-full"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
}
