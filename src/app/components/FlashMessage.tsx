import { AlertTriangle, X } from "lucide-react";
import { cn } from "./ui/utils";

/**
 * DS flash message (NG-23 "Flash Messages", node 4478:17904 — Warning variant).
 * Light surface that stands out over the dark app; icon + title on the left, the
 * message below it, and a dismiss control on the right. Width adapts to the message.
 */
interface FlashMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  /** Override the wrapper (e.g. width). Defaults to a content-capped toast width. */
  className?: string;
}

export function WarningFlash({ title = "Warning", message, onDismiss, className }: FlashMessageProps) {
  // DS tokens (light theme): bg Fill/Accent/fill-accent-orange #FFECDE, text Text/text-high #353740,
  // radius-100 (8px), shadow-button. Title/icon use an AA-safe warning orange (#9A3D0F, 5.9:1 on #FFECDE).
  const fontFamily = "var(--font-family-open), ui-sans-serif, system-ui, sans-serif";
  return (
    <div
      role="status"
      style={{ fontFamily }}
      className={cn(
        "flex w-full max-w-[420px] items-start gap-3 rounded-[8px] border border-[#F4D8C2] bg-[#FFECDE] px-4 py-3 shadow-[0_2px_4px_0_rgba(0,52,99,0.10)]",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#9A3D0F]" aria-hidden />
      <div className="min-w-0 flex-1">
        <p style={{ fontFamily, fontSize: "16px", fontWeight: 600, lineHeight: "16px", color: "#9A3D0F" }}>
          {title}
        </p>
        <p
          className="mt-1.5"
          style={{ fontFamily, fontSize: "14px", fontWeight: 400, lineHeight: "20px", color: "#353740" }}
        >
          {message}
        </p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-0.5 shrink-0 rounded-sm p-1 text-[#353740] outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#9A3D0F]"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
