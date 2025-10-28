import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '@/contexts/SecureAuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSecureAuth();
  const location = useLocation();

  // Debug logging
  React.useEffect(() => {
    console.log('[ProtectedRoute] State:', { isAuthenticated, isLoading, path: location.pathname });
  }, [isAuthenticated, isLoading, location.pathname]);

  // Prevent infinite loading with timeout fallback
  const [showFallback, setShowFallback] = React.useState(false);
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('[ProtectedRoute] Timeout reached, showing fallback');
        setShowFallback(true);
      }
    }, 5000); // 5 second timeout (reduced)
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Show loading skeleton while checking authentication
  if (isLoading && !showFallback) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center px-6">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="flex">
          <aside className="w-64 border-r border-border bg-card">
            <div className="p-4 space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </aside>
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Fallback to login if timeout reached - use hard refresh
  if (showFallback && !isAuthenticated) {
    console.log('[ProtectedRoute] Fallback redirect to login with hard refresh');
    window.location.assign('/auth');
    return null;
  }

  // Redirect to secure login if not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to login - not authenticated');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('[ProtectedRoute] Rendering protected content');
  return <>{children}</>;
};