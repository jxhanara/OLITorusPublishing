import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertTriangle } from "lucide-react";

interface AutoPushConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionCount: number;
  onConfirm: () => void;
}

export function AutoPushConfirmationModal({
  open,
  onOpenChange,
  sectionCount,
  onConfirm,
}: AutoPushConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "DISABLE AUTO-PUSH";
  const isValid = confirmText === expectedText;

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmText("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setConfirmText("");
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={
          "gap-0 overflow-hidden rounded-sm border border-[#525252] bg-[#262626] p-0 " +
          "text-white shadow-2xl sm:max-w-[520px] [&>button]:text-[#a3a3a3] " +
          "[&>button]:hover:text-white [&>button]:hover:bg-white/5"
        }
      >
        <DialogHeader className="space-y-0 border-b border-[#525252] px-5 py-4 text-left sm:text-left">
          <div className="flex items-center gap-3 pr-8">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-950/80 ring-1 ring-red-500/40"
              aria-hidden
            >
              <AlertTriangle className="size-4 text-red-400" />
            </div>
            <DialogTitle className="text-lg font-semibold leading-tight text-white">
              Disable Auto-Push?
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Confirm disabling automatic push of publication updates. You must type the phrase{" "}
            {expectedText} to enable the disable action.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex gap-3 border-b border-[#525252] bg-[#0d0c0f] px-5 py-3.5"
          role="status"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-[#f97316]"
            aria-hidden
          />
          <p className="text-sm font-bold leading-snug text-[#fb923c]">
            Warning: This will require manual updates for {sectionCount} sections.
          </p>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-base font-normal leading-6 text-[#d4d4d4]">
            Disabling auto-push means that any changes you publish will NOT automatically appear in
            the delivery environment. Instructors and learners will continue to see the old content
            until you manually push updates to each section.
          </p>
          <p className="text-sm font-normal leading-5 text-[#a3a3a3]">
            This setting is only recommended for advanced users who need granular control over
            content deployment.
          </p>
        </div>

        <div className="px-5 pb-1">
          <Label htmlFor="confirm-text" className="text-sm font-normal text-[#d4d4d4]">
            Type <span className="font-mono text-sm font-bold text-white">{expectedText}</span>{" "}
            to confirm
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type here to confirm..."
            className={
              "mt-2 h-10 rounded border border-[#525252] bg-[#1e1e1e] px-3 py-2 font-mono text-sm " +
              "text-white placeholder:text-[#737373] focus-visible:border-[#275CAF] " +
              "focus-visible:ring-1 focus-visible:ring-[#275CAF]"
            }
          />
        </div>

        <DialogFooter className="mt-0 flex-row justify-end gap-3 border-t border-[#525252] bg-[#1e1e1e] px-5 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="h-auto rounded-sm border-[#525252] bg-transparent px-4 py-2 text-base font-normal text-[#d4d4d4] hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className={
              "h-auto rounded-sm px-4 py-2 text-base font-normal text-white " +
              "bg-[#b91c1c] hover:bg-[#991b1b] disabled:pointer-events-none " +
              "disabled:bg-[#3f3f46] disabled:text-[#737373] disabled:opacity-100"
            }
          >
            Disable Auto-Push
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
