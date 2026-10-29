import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleResetStorage = () => {
    if (window.confirm('Tem certeza? Isso irá restaurar os dados iniciais do sistema mantendo o banco Firestore seguro.')) {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Falha ao limpar storage:', e);
      }
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Ops! Ocorreu um erro inesperado
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                O aplicativo encontrou uma falha temporária. Seus dados no Firestore e localmente estão preservados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recarregar Sistema
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Início
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700/50 flex items-center justify-center">
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Limpar cache local e reiniciar
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <summary className="cursor-pointer text-slate-300 font-medium select-none">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-rose-300/80 whitespace-pre-wrap font-mono break-all text-[10px]">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
