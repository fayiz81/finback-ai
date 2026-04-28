import React from 'react';

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#08080f', padding: 24,
        }}>
          <div style={{
            maxWidth: 480, textAlign: 'center',
            background: 'rgba(16,14,31,0.9)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 20, padding: '40px 32px',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{
                padding: '10px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
