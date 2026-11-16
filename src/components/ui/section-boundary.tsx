"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/status";
import { logError } from "@/lib/logger";

interface Props {
  title: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Isola uma seção: a falha de um bloco não derruba a página. */
export class SectionBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    logError(`section.${this.props.title}`, error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorState
          title={`Não foi possível mostrar ${this.props.title}`}
          message={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
