import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
          <div className="glass-panel p-10 max-w-xl w-full border-red-500/30 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">System Disruption</h1>
            
            <p className="text-white/60 mb-8 leading-relaxed">
              We encountered an unexpected technical error while processing the request. This might be due to a connection issue or a temporary service disruption.
            </p>

            {this.state.error && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-8 text-left">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Error Registry</p>
                <code className="text-xs text-red-300 font-mono break-all bg-black/40 p-2 block rounded border border-red-500/10">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-red-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] uppercase tracking-widest text-sm"
              >
                <RefreshCw size={18} /> Restart System
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
              >
                <Home size={18} /> Return Home
              </button>
            </div>
            
            <p className="mt-8 text-[10px] text-white/20 uppercase font-bold tracking-[0.2em]">
              Reference Code: NCET_ERR_{Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
