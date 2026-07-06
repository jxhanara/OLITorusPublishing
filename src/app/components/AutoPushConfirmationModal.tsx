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

/**
 * Disable Auto Push confirmation — the whole dialog is the DS warning surface
 * (Fill/Accent/fill-accent-orange #FFECDE). The dialog title doubles as the warning
 * header (icon + title), so there is no separate "Warning" label. All colors are
 * AA-checked against the light surface; the destructive button uses a darkened red
 * (#B3261E) because the DS danger pairing (#FF4040 / #FF8787) fails AA on light.
 */
export function AutoPushConfirmationModal({
  open,
  onOpenChange,
  sectionCount,
  onConfirm,
}: AutoPushConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "DISABLE AUTO PUSH";
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
        style={{ fontFamily: "var(--font-family-open), ui-sans-serif, system-ui, sans-serif" }}
        className={
          "gap-0 overflow-hidden rounded-[8px] border border-[#F0CFB2] bg-[#FFECDE] p-0 " +
          "text-[#353740] shadow-2xl sm:max-w-[520px] [&>button]:text-[#353740] " +
          "[&>button]:hover:text-black [&>button]:hover:bg-black/5"
        }
      >
        {/* Warning header: dialog title doubles as the warning heading (icon + title). */}
        <DialogHeader className="space-y-0 px-5 pt-5 pb-3 text-left sm:text-left">
          <div className="flex items-center gap-3 pr-8">
            <AlertTriangle className="size-6 shrink-0 text-[#9A3D0F]" aria-hidden />
            <DialogTitle className="!text-[20px] !font-bold leading-tight text-[#9A3D0F]">
              Disable Auto Push?
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Confirm disabling automatic push of publication updates. You must type the phrase{" "}
            {expectedText} to enable the disable action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-4">
          {/* Primary consequence — boxed so it's the first thing scanned. */}
          <div className="rounded-md border border-[#F0CFB2] bg-white/60 px-3.5 py-3">
            <p className="!text-[15px] !font-bold leading-6 text-[#9A3D0F]">
              This will require manual updates for {sectionCount} sections.
            </p>
          </div>
          <p className="!text-[15px] !font-normal leading-6 text-[#353740]">
            With auto-push off, changes you publish won't automatically appear for instructors and
            learners. They'll keep seeing the current content until each section is manually updated.
          </p>
        </div>

        <div className="px-5 pb-1">
          <Label htmlFor="confirm-text" className="!text-sm !font-normal text-[#353740]">
            Type <span className="!font-mono !text-sm !font-bold text-[#353740]">{expectedText}</span>{" "}
            to confirm
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type here to confirm..."
            className={
              "mt-2 h-10 rounded border border-[#7A7C85] !bg-white px-3 py-2 font-mono text-sm " +
              "text-[#353740] placeholder:text-[#6B6D78] focus-visible:border-[#0062F2] " +
              "focus-visible:ring-1 focus-visible:ring-[#0062F2]"
            }
          />
        </div>

        <DialogFooter className="mt-0 flex-row justify-end gap-3 px-5 pt-4 pb-5 sm:justify-end">
          <Button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="h-auto rounded-sm border border-[#7A7C85] bg-transparent px-4 py-2 text-base font-normal text-[#353740] hover:bg-black/5 hover:text-[#353740]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className={
              "h-auto rounded-sm border border-[#B3261E] bg-transparent px-4 py-2 text-base font-normal text-[#B3261E] " +
              "hover:bg-[#B3261E]/10 hover:text-[#B3261E] disabled:pointer-events-none " +
              "disabled:border-[#D8C3B0] disabled:bg-transparent disabled:text-[#A89B8E] disabled:opacity-100"
            }
          >
            Disable Auto Push
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
