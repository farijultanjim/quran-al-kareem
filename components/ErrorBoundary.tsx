"use client";

import React, { ReactNode, ErrorInfo } from "react";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-destructive/80" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>

            <p className="text-foreground/60 mb-6">
              We encountered an unexpected error. Please try again or return to
              the home page.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-mono text-destructive/80 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={this.resetError}
                className="flex-1 px-4 py-3 bg-primary text-background font-semibold rounded-lg hover:opacity-90 transition"
              >
                Try Again
              </button>

              <Link
                href="/"
                className="flex-1 px-4 py-3 bg-secondary text-foreground font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
