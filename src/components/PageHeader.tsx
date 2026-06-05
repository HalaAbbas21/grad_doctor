import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, back, action }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="mb-5 flex items-start gap-3">
      {back && (
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => navigate(-1)} aria-label="رجوع">
          <ArrowRight className="size-5" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
