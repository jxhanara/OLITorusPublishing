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

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setConfirmText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
            </div>
            <DialogTitle className="text-xl">Disable Auto-Push?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 text-base">
          <div className="font-semibold text-chart-3">
            ⚠️ Warning: This will require manual updates for {sectionCount} sections.
          </div>
          <div className="text-foreground">
            Disabling auto-push means that any changes you publish will NOT automatically
            appear in the delivery environment. Instructors and learners will continue to see
            the old content until you manually push updates to each section.
          </div>
          <div className="text-sm text-muted-foreground">
            This setting is only recommended for advanced users who need granular control over
            content deployment.
          </div>
        </div>

        <div className="py-4">
          <Label htmlFor="confirm-text" className="text-sm font-medium">
            Type <span className="font-mono font-bold">{expectedText}</span> to confirm
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type here to confirm..."
            className="mt-2 font-mono"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmText("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Disable Auto-Push
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
