import { useState, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { AutoPushConfirmationModal } from "../components/AutoPushConfirmationModal";
import { PublishProgressBar } from "../components/PublishProgressBar";
import {
  PublishHistorySection,
  getDefaultIncludedPendingChangeIds,
  getPendingChangeCount,
} from "../components/PublishHistorySection";
import { ChevronDown, Link2 } from "lucide-react";
import { toast } from "sonner";

function SortableHeader({ children }: { children: ReactNode }) {
  return (
    <span className="ol-sort-chevron inline-flex items-end gap-1">
      {children}
      <ChevronDown className="size-5 shrink-0 text-white" aria-hidden />
    </span>
  );
}

export function PublishDashboard() {
  const [autoPushEnabled, setAutoPushEnabled] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [publishProgress, setPublishProgress] = useState(0);
  const [changeDescription, setChangeDescription] = useState("");
  const [includedPendingChangeIds, setIncludedPendingChangeIds] = useState<string[]>(() =>
    getDefaultIncludedPendingChangeIds(),
  );
  const pendingChangeTotal = getPendingChangeCount();
  const includedPendingCount = includedPendingChangeIds.length;
  const publishSelectionBlocked = pendingChangeTotal > 0 && includedPendingCount === 0;

  const activeSections = [
    {
      id: "1",
      title: "OLI Publication Course",
      version: "v0.3.3",
      creator: "Nam, Hanara",
      instructors: "Nam, Hanara",
      relationshipType: "Base Project",
      startDate: "1 month ago",
      endDate: "in 3 months",
    },
  ];

  const handleAutoPushToggle = (checked: boolean) => {
    if (!checked) {
      setShowConfirmModal(true);
    } else {
      setAutoPushEnabled(true);
      toast.success("Auto-push enabled");
    }
  };

  const handleConfirmDisableAutoPush = () => {
    setAutoPushEnabled(false);
    toast.warning("Auto-push disabled");
  };

  const handlePublish = () => {
    const selectedCount = includedPendingChangeIds.length;
    setPublishStatus("publishing");
    setPublishProgress(0);

    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPublishStatus("success");
          toast.success(
            selectedCount > 0
              ? `Published successfully (${selectedCount} selected change${selectedCount === 1 ? "" : "s"})`
              : "Changes published successfully",
          );
          setTimeout(() => setPublishStatus("idle"), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="ol-publish-page">
      <div className="ol-publish-inner space-y-6">
        <header className="space-y-4 pb-2">
          <h1 className="text-[28px] font-normal leading-[42px] text-white">Publish</h1>
          <p className="text-lg font-normal leading-[27px] text-white">Publication Details</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-3xl text-base font-normal leading-6 text-white">
              Publish your project to give instructors access to the latest changes.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-auto shrink-0 gap-2 rounded-sm border-[#275CAF] bg-transparent px-3 py-2 text-base font-normal text-[#275CAF] hover:bg-[#275CAF]/10 hover:text-[#275CAF]"
            >
              <Link2 className="size-4" aria-hidden />
              Connect with LTI 1.3
            </Button>
          </div>
          <div>
            <span className="inline-block rounded-[4px] px-2 py-0.5 text-[14px] font-bold leading-[14px] text-white bg-[#737373]">
              Latest Publication: v0.3.6
            </span>
          </div>
          <p className="pt-1 text-base font-normal leading-6 text-white">
            Last published <strong className="font-bold">1 month ago</strong>.{" "}
            {pendingChangeTotal === 0 ? (
              <>There are no pending changes since last publish.</>
            ) : (
              <>
                There {pendingChangeTotal === 1 ? "is" : "are"}{" "}
                <strong className="font-bold">{pendingChangeTotal}</strong> pending change
                {pendingChangeTotal === 1 ? "" : "es"} since last publish
                {includedPendingCount > 0 ? (
                  <>
                    ; <strong className="font-bold">{includedPendingCount}</strong>{" "}
                    {includedPendingCount === 1 ? "is" : "are"} selected to include in the next publish.
                  </>
                ) : (
                  <span className="text-[#fbbf24]">
                    . Select at least one pending change in the table below (Include column), or none
                    will ship with this publish.
                  </span>
                )}
              </>
            )}
          </p>
        </header>

        {publishStatus !== "idle" && (
          <div className="flex justify-center">
            <PublishProgressBar
              status={publishStatus}
              progress={publishProgress}
              message={publishStatus === "publishing" ? "Deploying to delivery servers..." : undefined}
              onCancel={() => {
                setPublishStatus("idle");
                setPublishProgress(0);
                toast.info("Publishing cancelled");
              }}
            />
          </div>
        )}

        <PublishHistorySection
          includedPendingChangeIds={includedPendingChangeIds}
          onIncludedPendingChangeIdsChange={setIncludedPendingChangeIds}
        />

        <div className="ol-publish-divider flex flex-col gap-3 pt-7 pb-4">
          <Label htmlFor="description" className="sr-only">
            Change description
          </Label>
          <Textarea
            id="description"
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="Enter a short description of these changes..."
            className="min-h-[120px] resize-y rounded border border-[#525252] bg-[#1E1E1E] px-2 py-3 text-base font-normal leading-6 text-white placeholder:text-[#737373] focus-visible:border-[#275CAF] focus-visible:ring-1 focus-visible:ring-[#275CAF]"
          />

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="auto-push"
              checked={autoPushEnabled}
              onCheckedChange={handleAutoPushToggle}
              className="size-4 border-[#737373] bg-[#262626] data-[state=checked]:border-[#3B76D3] data-[state=checked]:bg-[#3B76D3]"
            />
            <Label htmlFor="auto-push" className="cursor-pointer text-base font-normal leading-6 text-white">
              Automatically push this publication update to all templates and sections
            </Label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Button
              type="button"
              onClick={handlePublish}
              disabled={publishStatus === "publishing" || publishSelectionBlocked}
              title={
                publishSelectionBlocked
                  ? "Choose one or more pending changes in the history table to include in this publish."
                  : undefined
              }
              className="h-auto rounded-sm bg-[#3B76D3] px-3 py-2 text-base font-normal text-white hover:bg-[#3264b8] disabled:opacity-60"
            >
              Publish
            </Button>
            <span className="text-base font-normal leading-6 text-white">v0.3.6</span>
          </div>
        </div>

        <div className="h-px shrink-0 bg-[#E5E5E5]" aria-hidden />

        <section className="space-y-5 pt-5">
          <h2 className="text-lg font-normal leading-[27px] text-white">This project has 1 active course sections</h2>
          <p className="text-base font-normal leading-6 text-white">Showing all results (1 total)</p>

          <div className="ol-publish-table-wrap">
            <Table className="ol-publish-table">
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="h-auto">
                    <SortableHeader>Title</SortableHeader>
                  </TableHead>
                  <TableHead className="h-auto">
                    <SortableHeader>Current Publication</SortableHeader>
                  </TableHead>
                  <TableHead className="h-auto">
                    <SortableHeader>Creator</SortableHeader>
                  </TableHead>
                  <TableHead className="h-auto">
                    <SortableHeader>Instructors</SortableHeader>
                  </TableHead>
                  <TableHead className="h-auto">
                    <SortableHeader>Relationship Type</SortableHeader>
                  </TableHead>
                  <TableHead className="h-auto">
                    <SortableHeader>Start Date</SortableHeader>
                  </TableHead>
                  <TableHead className="h-auto">
                    <SortableHeader>End Date</SortableHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSections.map((section) => (
                  <TableRow key={section.id} className="border-0">
                    <TableCell className="font-normal">{section.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[14px] font-bold leading-[14px] text-white bg-[#275CAF]">
                        {section.version}
                      </span>
                    </TableCell>
                    <TableCell>{section.creator}</TableCell>
                    <TableCell>{section.instructors}</TableCell>
                    <TableCell>{section.relationshipType}</TableCell>
                    <TableCell>{section.startDate}</TableCell>
                    <TableCell>{section.endDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <AutoPushConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        sectionCount={24}
        onConfirm={handleConfirmDisableAutoPush}
      />
    </div>
  );
}
