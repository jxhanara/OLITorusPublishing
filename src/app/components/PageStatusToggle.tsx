import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { CheckCircle2, FileEdit } from "lucide-react";

interface PageStatusToggleProps {
  isReady: boolean;
  onToggle: (ready: boolean) => void;
  pageName?: string;
}

export function PageStatusToggle({
  isReady,
  onToggle,
  pageName = "this page",
}: PageStatusToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
            {isReady ? (
              <CheckCircle2 className="w-4 h-4 text-chart-2" />
            ) : (
              <FileEdit className="w-4 h-4 text-muted-foreground" />
            )}
            <Badge
              variant={isReady ? "default" : "secondary"}
              className={`${
                isReady
                  ? "bg-chart-2 hover:bg-chart-2/90"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isReady ? "Ready" : "Draft"}
            </Badge>
            <Switch checked={isReady} onCheckedChange={onToggle} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {isReady
              ? `${pageName} will be included in the next publish`
              : `${pageName} is excluded from publishing until marked as Ready`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
