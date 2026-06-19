import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught rendering exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 rounded-2xl glass-panel border border-error/30 bg-error/5 flex flex-col items-center justify-center text-center py-20 gap-5 max-w-lg mx-auto mt-10">
          <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/25 text-error flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider font-space text-white">System Diagnostics Fault</h3>
            <p className="text-xs text-mutedGray font-outfit mt-2 leading-relaxed">
              A rendering exception occurred in this module:
            </p>
            <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded-xl text-left font-mono text-[10px] text-error overflow-x-auto max-w-full">
              {this.state.error?.message || 'Unknown render crash'}
            </div>
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl bg-error text-white text-xs font-bold uppercase tracking-wider font-space flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
