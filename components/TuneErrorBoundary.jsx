'use client';

import React from 'react';

/**
 * Error Boundary — catches runtime errors in child components
 * and shows a friendly fallback instead of a white screen.
 */
export default class TuneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[TuneErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '600px',
          background: 'rgba(255, 51, 68, 0.08)',
          border: '1px solid rgba(255, 51, 68, 0.25)',
          borderRadius: '12px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ 
            color: '#ef4444', 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.2rem',
            marginBottom: '0.5rem'
          }}>
            Terjadi Kesalahan Kalkulasi
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Salah satu modul matematika mengalami error. Coba periksa nilai input Anda 
            — pastikan semua field berisi angka yang valid.
          </p>
          <p style={{ 
            color: '#666', 
            fontSize: '0.75rem', 
            fontFamily: 'var(--font-mono)',
            background: 'rgba(0,0,0,0.3)',
            padding: '0.75rem',
            borderRadius: '6px',
            textAlign: 'left',
            wordBreak: 'break-all'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1.5rem',
              padding: '0.6rem 2rem',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
