import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { cn } from "./ui/utils";

interface QuizQuestion {
  question: string;
  answers: Array<{
    text: string;
    status?: "added" | "removed" | "unchanged";
  }>;
}

export interface PageChange {
  id: string;
  title: string;
  breadcrumb: string[];
  learningObjectives: Array<{
    text: string;
    status?: "added" | "removed" | "unchanged";
  }>;
  currentQuestions: QuizQuestion[];
  newQuestions: QuizQuestion[];
  /** When set (and no quiz content), text diff uses these per page instead of modal-level strings */
  currentVersionText?: string;
  newVersionText?: string;
}

interface DiffViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVersion?: string;
  newVersion?: string;
  pageName: string;
  changes?: PageChange[];
}

export function DiffViewModal({
  open,
  onOpenChange,
  pageName,
  changes,
  currentVersion = "",
  newVersion = "",
}: DiffViewModalProps) {
  const pages = useMemo<PageChange[]>(() => {
    if (changes && changes.length > 0) return changes;
    return [
      {
        id: "default",
        title: pageName,
        breadcrumb: [pageName],
        learningObjectives: [],
        currentQuestions: [],
        newQuestions: [],
      },
    ];
  }, [changes, pageName]);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentPageIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setCurrentPageIndex((i) => (i >= pages.length ? 0 : i));
  }, [pages.length]);

  const selectedPage = pages[Math.min(currentPageIndex, pages.length - 1)] ?? pages[0];

  const totalPages = pages.length;
  const isFirstPage = currentPageIndex <= 0;
  const isLastPage = currentPageIndex >= totalPages - 1;

  const goToPreviousPage = () => {
    if (!isFirstPage) setCurrentPageIndex((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (!isLastPage) setCurrentPageIndex((prev) => prev + 1);
  };

  const hasQuizContent =
    selectedPage.learningObjectives.length > 0 ||
    selectedPage.currentQuestions.length > 0 ||
    selectedPage.newQuestions.length > 0;

  const currentText = selectedPage.currentVersionText ?? currentVersion;
  const newText = selectedPage.newVersionText ?? newVersion;

  const scrollKey = `${selectedPage.id}-${currentPageIndex}`;

  const renderTextDiff = (text: string, type: "current" | "new") => {
    const lines = text.split("\n");
    return (
      <div className="space-y-1 p-4">
        {lines.map((line, idx) => {
          const isChanged = line.includes("updated") || line.includes("modern") || line.includes("added");
          const isDeleted = type === "current" && line.includes("removed");
          const isAdded = type === "new" && line.includes("added");

          return (
            <div
              key={idx}
              className={`px-3 py-1 text-sm ${
                isDeleted
                  ? "bg-destructive/5 text-destructive-foreground line-through"
                  : isAdded
                    ? "bg-chart-2/5 text-chart-2"
                    : isChanged
                      ? type === "current"
                        ? "bg-destructive/5 text-destructive-foreground"
                        : "bg-chart-2/5 text-chart-2"
                      : "text-foreground"
              }`}
            >
              <span className="mr-3 select-none font-mono text-muted-foreground">{idx + 1}</span>
              {line || " "}
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuizContent = (questions: QuizQuestion[], type: "current" | "new") => {
    return (
      <div className="space-y-6 p-4">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="caption mb-2 text-muted-foreground">QUESTION</div>
              <p className="text-foreground">{q.question}</p>
            </div>

            <div className="space-y-2">
              {q.answers.map((answer, aIdx) => {
                const bgColor =
                  answer.status === "added"
                    ? "border-chart-2 bg-chart-2/10"
                    : answer.status === "removed"
                      ? "border-destructive bg-destructive/10"
                      : "bg-card";

                const isRemoved = answer.status === "removed";

                return (
                  <div
                    key={aIdx}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${bgColor} ${
                      isRemoved ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{aIdx + 1}</span>
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    </div>
                    <span className={`text-foreground ${isRemoved ? "line-through" : ""}`}>{answer.text}</span>
                    {answer.status === "added" && type === "new" && (
                      <Badge className="ml-auto bg-chart-2/20 text-xs text-chart-2">Added</Badge>
                    )}
                    {answer.status === "removed" && type === "current" && (
                      <X className="ml-auto h-4 w-4 text-destructive" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const navButtonClass = cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background",
    "text-foreground shadow-sm transition-all outline-none",
    "hover:border-primary/40 hover:bg-primary/10 hover:text-foreground",
    "active:scale-[0.96] active:bg-primary/20",
    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:hover:border-border disabled:hover:bg-background",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] !max-w-none w-[96vw] flex-col">
        <DialogHeader>
          <div className="space-y-3">
            <DialogTitle className="text-xl">Compare Changes</DialogTitle>
            <DialogDescription className="sr-only">
              Compare the current version with the new version to see what has changed
            </DialogDescription>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {selectedPage.breadcrumb.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span>{crumb}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {hasQuizContent && selectedPage.learningObjectives.length > 0 && (
          <div className="space-y-2">
            <div className="caption text-muted-foreground">LEARNING OBJECTIVES</div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                {selectedPage.learningObjectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      obj.status === "added"
                        ? "text-chart-2"
                        : obj.status === "removed"
                          ? "text-destructive line-through"
                          : "text-foreground"
                    }`}
                  >
                    <span>•</span>
                    <span className="flex-1">{obj.text}</span>
                    {obj.status === "added" && (
                      <Badge className="bg-chart-2/20 text-xs text-chart-2">Added</Badge>
                    )}
                    {obj.status === "removed" && <X className="h-4 w-4 shrink-0 text-destructive" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-destructive/5 px-4 py-3">
              <Badge variant="outline" className="bg-card">
                Current Version
              </Badge>
            </div>
            <ScrollArea key={`${scrollKey}-current`} className="min-h-0 flex-1">
              {hasQuizContent
                ? renderQuizContent(selectedPage.currentQuestions, "current")
                : renderTextDiff(currentText, "current")}
            </ScrollArea>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-chart-2/5 px-4 py-3">
              <Badge variant="outline" className="bg-card">
                New Version
              </Badge>
            </div>
            <ScrollArea key={`${scrollKey}-new`} className="min-h-0 flex-1">
              {hasQuizContent
                ? renderQuizContent(selectedPage.newQuestions, "new")
                : renderTextDiff(newText, "new")}
            </ScrollArea>
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-destructive-foreground bg-destructive/10" />
              <span>Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-chart-2 bg-chart-2/10" />
              <span>Added</span>
            </div>
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Compare pages"
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex-1" aria-hidden />
              <div className="flex flex-none items-center gap-5">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={isFirstPage}
                  className={navButtonClass}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <span
                  className="min-w-[4.5rem] text-center text-sm font-medium tabular-nums text-foreground"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {currentPageIndex + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={isLastPage}
                  className={navButtonClass}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="flex-1" aria-hidden />
            </nav>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
