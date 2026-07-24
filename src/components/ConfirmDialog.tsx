import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/ar";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
  /**
   * When provided, the dialog stops auto-closing on confirm and instead
   * disables both buttons while true — for writes that must not show an
   * optimistic "done" state before the (mock) server responds. The caller
   * is responsible for closing the dialog once the async attempt settles.
   */
  loading?: boolean;
}

/** Confirm step for clinical writes (§4.5). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
  children,
  loading,
}: ConfirmDialogProps) {
  const nonOptimistic = loading !== undefined;
  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={loading}
            onClick={() => {
              onConfirm();
              if (!nonOptimistic) onOpenChange(false);
            }}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel ?? t.common.confirm}
          </Button>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
