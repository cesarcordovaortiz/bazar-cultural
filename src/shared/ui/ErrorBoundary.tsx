import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Bazar Cultural UI error', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return <main className="mx-auto max-w-xl px-4 py-16"><section role="alert" className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><h1 className="text-2xl font-semibold text-slate-950">No pudimos cargar esta vista</h1><p className="mt-3 text-slate-600">Intenta actualizar la página. Si el problema continúa, vuelve al catálogo.</p><button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Actualizar página</button></section></main>;
    }
    return this.props.children;
  }
}
