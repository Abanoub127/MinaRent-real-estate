import { useRouteError, isRouteErrorResponse } from 'react-router';
import { useEffect } from 'react';
import { ServerErrorPage } from '../pages/public/ServerErrorPage';

export function RouteErrorFallback() {
  const error = useRouteError();

  const errorMessage = error instanceof Error ? error.message : '';
  const isChunkLoadError =
    errorMessage.includes('error loading dynamically imported module') ||
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Importing a module script failed');

  useEffect(() => {
    if (isChunkLoadError) {
      const reloadKey = 'app_chunk_reloaded';
      const hasReloaded = sessionStorage.getItem(reloadKey);
      if (!hasReloaded) {
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
      } else {
        sessionStorage.removeItem(reloadKey);
      }
    }
  }, [isChunkLoadError]);

  // If we're about to reload, show nothing to avoid flash
  if (isChunkLoadError && !sessionStorage.getItem('app_chunk_reloaded')) {
    return null;
  }

  // 404 from router (e.g. isRouteErrorResponse with status 404)
  // is already handled by the path="*" catch-all, so here we only
  // land on real runtime/server errors.
  const handleRetry = () => {
    sessionStorage.removeItem('app_chunk_reloaded');
    window.location.reload();
  };

  // Log non-chunk errors for debugging
  if (!isChunkLoadError) {
    console.error('[RouteErrorFallback]', error);
  }

  return <ServerErrorPage onRetry={handleRetry} />;
}
