import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface PublishProgressBarProps {
  status: "idle" | "publishing" | "success" | "error";
  progress: number;
  onCancel?: () => void;
  message?: string;
}

export function PublishProgressBar({
  status,
  progress,
  onCancel,
  message,
}: PublishProgressBarProps) {
  if (status === "idle") return null;

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === "publishing" && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-4 h-4 text-chart-2" />
            )}
            {status === "error" && <XCircle className="w-4 h-4 text-destructive-foreground" />}
            
            <span className="text-sm font-medium">
              {status === "publishing" && "Publishing changes..."}
              {status === "success" && "Published successfully"}
              {status === "error" && "Publishing failed"}
            </span>
          </div>

          {status === "publishing" && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        {status === "publishing" && (
          <Progress value={progress} className="h-2" />
        )}

        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
