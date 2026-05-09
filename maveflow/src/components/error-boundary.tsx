"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Log to Sentry
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong.</h1>
          <p className="text-zinc-400 max-w-md mb-8">
            An unexpected error occurred in the application. Our engineering team has been notified via Sentry.
          </p>
          <div className="bg-black border border-white/10 p-4 rounded-xl max-w-2xl overflow-auto text-left mb-8">
            <code className="text-red-400 text-sm">{this.state.error?.message}</code>
          </div>
          <Button 
            onClick={() => window.location.href = "/dashboard"} 
            className="bg-white text-black hover:bg-zinc-200"
          >
            Return to Dashboard
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
