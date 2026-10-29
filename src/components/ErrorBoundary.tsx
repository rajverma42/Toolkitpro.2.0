import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            maxWidth: 680,
            margin: '40px auto',
            padding: '32px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            textAlign: 'center',
            boxShadow: '0 8px 30px var(--shadow)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'color-mix(in srgb, #EF4444 15%, transparent)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>
            {this.props.fallbackTitle || 'Something went wrong while rendering this section.'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: '0 auto 20px', maxWidth: 480 }}>
            {this.state.error?.message || 'An unexpected error occurred. You can reset this tool or return to all tools.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn primary"
              onClick={this.handleReset}
            >
              Try Again
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                window.location.hash = '#all-tools';
                window.location.reload();
              }}
            >
              Browse All Tools
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
