import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { delay } from "@/lib/utils";
import { t } from "@/i18n/ar";

/**
 * Mock PDF viewer + download. Honors the global "simulate download error" toggle
 * to demonstrate error-state handling (§6.7 / §8).
 */
export function PdfViewer({ fileName }: { fileName: string }) {
  const simulateError = useAppStore((s) => s.simulateDownloadError);
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const onDownload = async () => {
    setDownloading(true);
    setError(false);
    await delay(700);
    setDownloading(false);
    if (simulateError) {
      setError(true);
      toast.error("تعذّر تنزيل الملف", "حدث خطأ في الشبكة. حاول مرة أخرى.");
      return;
    }
    toast.success("تم بدء التنزيل", fileName);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
      {/* Mock document preview */}
      <div className="flex aspect-[4/3] max-h-72 items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(0,0,0,0.02)_12px,rgba(0,0,0,0.02)_24px)]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <FileText className="size-12" />
          <p className="text-sm font-bold">{fileName}</p>
          <p className="text-xs">معاينة الملف (نموذج تجريبي)</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card p-3">
        <span className="truncate text-sm text-muted-foreground">{fileName}</span>
        <Button size="sm" variant="outline" onClick={onDownload} disabled={downloading}>
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {t.common.download}
        </Button>
      </div>
      {error && (
        <div className="p-3">
          <ErrorState message="تعذّر تنزيل الملف" onRetry={onDownload} />
        </div>
      )}
    </div>
  );
}
