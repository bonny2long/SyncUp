import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 text-sm">
                Something went wrong
              </h3>
              <p className="text-red-700 text-xs mt-1">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <button
                onClick={this.handleReset}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ChartError - Specific error state for chart components
 */
export function ChartError({ onRetry, error }) {
  return (
    <div className="w-full p-6 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">Failed to load chart</h3>
      <p className="text-sm text-gray-600 mb-4">
        {error || "Unable to fetch data. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}
