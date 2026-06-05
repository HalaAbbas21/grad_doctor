import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

/** Friendly empty state for any list/data area (§4.6). */
export function EmptyState({
  title,
  description,
  icon,
  tone = "muted",
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: "muted" | "success";
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <div
        className={
          tone === "success"
            ? "flex size-14 items-center justify-center rounded-full bg-secondary-soft text-secondary"
            : "flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        }
      >
        {icon ?? <Inbox className="size-7" />}
      </div>
      <p className="text-base font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Error state with retry (§4.6). */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" />
      </div>
      <p className="text-base font-bold text-foreground">{message ?? "حدث خطأ أثناء التحميل"}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" /> إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

/** Skeleton list for loading states. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
