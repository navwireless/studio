'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from './error-boundary';

interface Props {
  children: React.ReactNode;
}

export function MapErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="fixed inset-0 z-0 bg-background/95 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 bg-muted rounded-full">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2 max-w-md px-6">
            <h3 className="text-xl font-semibold text-foreground">Map failed to load</h3>
            <p className="text-sm text-muted-foreground">
              This could be due to a network issue or API configuration problem.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-destructive mt-2">{error.message}</p>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="default" onClick={resetErrorBoundary}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
