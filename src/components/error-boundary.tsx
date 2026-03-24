'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Optional: custom fallback renderer that receives error and reset function */
  fallbackRender?: (props: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode;
  /** Optional: callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallbackRender, fallback } = this.props;

    if (hasError && error) {
      if (fallbackRender) {
        return fallbackRender({ error, resetErrorBoundary: this.resetErrorBoundary });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-destructive/50 bg-destructive/10 text-center space-y-4 m-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={this.resetErrorBoundary}>
              Try Again
            </Button>
            <Button variant="destructive" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}
