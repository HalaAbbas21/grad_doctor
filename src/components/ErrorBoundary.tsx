import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last-resort render-error catch so one bad field/screen degrades to a
 * readable card instead of taking down the whole app to a blank white
 * screen. Styling mirrors the existing ErrorState component.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-7" />
          </div>
          <p className="text-base font-bold text-foreground">حدث خطأ في عرض هذه الصفحة</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" /> إعادة المحاولة
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
