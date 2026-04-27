import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft, X, GripVertical, Copy, Trash2, Pencil, Users, MoreHorizontal } from "lucide-react";
import { cn } from "./ui/utils";
import { DiffCurriculumStaticContent } from "./DiffCurriculumStaticContent";

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
    status?: "added" | "removed" | "unchanged" | "edited";
  }>;
  currentQuestions: QuizQuestion[];
  newQuestions: QuizQuestion[];
  /** When set (and no quiz content), text diff uses these per page instead of modal-level strings */
  currentVersionText?: string;
  newVersionText?: string;
}

type ChangeKind = "added" | "edited" | "removed";

interface ChangeListEntry {
  id: string;
  kind: ChangeKind;
  label: string;
  meta: string;
  scrollTargetId: string;
}

type ViewMode = "full" | "diff";
type FilterKind = "all" | ChangeKind;

interface DiffViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVersion?: string;
  newVersion?: string;
  pageName: string;
  changes?: PageChange[];
  /** When set, show primary actions in the right column (e.g. wire to publish flow). */
  onPublishChanges?: () => void;
  onDiscardAll?: () => void;
}

/** Figma export tokens (curriculum + chrome) */
const torus = {
  shell: "bg-[#0D0C0F]",
  panel: "bg-[#262626]",
  canvas: "bg-[#0D0C0F]",
  inner: "bg-[#2A2B2E]",
  hairline: "border-[#404040]",
  link: "text-[#4CA6FF]",
  linkUi: "text-[#3B76D3]",
  crumbCurrent: "text-[#EEEBF5]",
  hair: "#525252",
  prose: "text-[#F5F5F5]",
  tableText: "text-[#D4D4D4]",
  added: "text-[#97c459]",
  addedBg: "bg-[#1f3d18]",
  addedBorder: "border-[#4a7c2f]",
  edited: "text-[#ef9f27]",
  editedBg: "bg-[#ef9f27]/10",
  editedBorder: "border-[#ef9f27]/40",
  removed: "text-[#f09595]",
  removedBg: "bg-[#e24b4a]/15",
  publish: "bg-[#3B76D3] hover:bg-[#3264b8] text-white",
} as const;

function loStatusToKind(status?: string): ChangeKind | null {
  if (status === "added") return "added";
  if (status === "removed") return "removed";
  if (status === "edited") return "edited";
  return null;
}

function questionChangeKind(current: QuizQuestion, next: QuizQuestion): ChangeKind | null {
  const promptEdited = current.question.trim() !== next.question.trim();
  const newTexts = new Set(next.answers.map((a) => a.text));
  const oldTexts = new Set(current.answers.map((a) => a.text));
  let added = 0;
  let removed = 0;
  for (const a of next.answers) {
    if (a.status === "added" || !oldTexts.has(a.text)) added++;
  }
  for (const a of current.answers) {
    if (a.status === "removed" || !newTexts.has(a.text)) removed++;
  }
  if (!promptEdited && added === 0 && removed === 0) return null;
  if (removed > 0 && added > 0) return "edited";
  if (promptEdited && (added > 0 || removed > 0)) return "edited";
  if (promptEdited) return "edited";
  if (added > 0) return "added";
  if (removed > 0) return "removed";
  return "edited";
}

function mergedAnswers(current: QuizQuestion, next: QuizQuestion) {
  const out: Array<{ text: string; status: "unchanged" | "added" | "removed" }> = [];
  const nextTextSet = new Set(next.answers.map((a) => a.text));

  for (const a of next.answers) {
    if (a.status === "added" || !current.answers.some((c) => c.text === a.text)) {
      out.push({ text: a.text, status: "added" });
    } else {
      out.push({ text: a.text, status: "unchanged" });
    }
  }

  for (const a of current.answers) {
    if (a.status === "removed" || !nextTextSet.has(a.text)) {
      if (!out.some((o) => o.text === a.text && o.status === "removed")) {
        out.push({ text: a.text, status: "removed" });
      }
    }
  }

  return out;
}

function LearnByDoingStrip() {
  return (
    <div className="flex items-center gap-3 bg-[#404040] px-8 py-4">
      <Pencil className="size-5 shrink-0 text-[#FAFAFA]" strokeWidth={1.75} aria-hidden />
      <span className="text-[20px] font-semibold uppercase leading-5 tracking-tight text-[#FAFAFA]">Learn by doing</span>
    </div>
  );
}

function LbdToolbarRow() {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-end gap-2 px-1 pt-0.5">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm border border-[#525252] bg-[#262626] px-2 py-1.5 text-[12px] text-[#BAB8BF]"
        aria-label="Collaborators"
      >
        <Users className="size-4" strokeWidth={1.75} />
        <ChevronRight className="size-3 rotate-90 opacity-70" aria-hidden />
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm border border-[#525252] bg-[#262626] px-2 py-1.5 text-[12px] text-white/90"
      >
        Learn by doing
        <ChevronRight className="size-3 rotate-90 opacity-70" aria-hidden />
      </button>
      <button type="button" className="rounded-sm p-2 text-white/80 hover:bg-white/5" aria-label="Delete section">
        <Trash2 className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function ScenarioPreviewBlock() {
  return (
    <div className="relative rounded-lg border border-[#404040] bg-[#2A2B2E] px-6 py-5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <button type="button" className="absolute right-4 top-4 rounded-sm p-2 text-white/80 hover:bg-white/5" aria-label="Delete scenario">
        <Trash2 className="size-4" strokeWidth={1.75} />
      </button>
      <h3 className="pr-10 text-2xl font-normal leading-9 text-white">Scenario: Yellowing Tomato Leaves</h3>
      <p className="mt-3 text-base leading-8 text-[#F5F5F5]">
        <span className="font-medium">Prompt:</span> You&apos;re growing a tomato plant in a container on your patio. For
        the past week, the lower (older) leaves have turned yellow and are falling off. The top of the plant is still green
        and growing, but not vigorously.
      </p>
    </div>
  );
}

function MultipleChoiceQuestionInner({
  neu,
  merged,
}: {
  neu: QuizQuestion;
  merged: ReturnType<typeof mergedAnswers>;
}) {
  return (
    <div className="space-y-5 px-5 pb-8 pt-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-transparent pb-1">
          <div className="flex flex-wrap items-end gap-2">
            <h3 className="text-2xl font-normal leading-9 text-white">Multiple Choice</h3>
            <span className="cursor-default rounded-sm px-2 py-1 text-[14px] text-[#3B76D3]">Edit Title</span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded-sm p-3 text-[#3B76D3] hover:bg-white/5" aria-label="Duplicate">
              <Copy className="size-4" strokeWidth={2} />
            </button>
            <button type="button" className="rounded-sm p-2 text-white hover:bg-white/5" aria-label="Delete">
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="rounded-md border border-[#404040] bg-[#3E3F44] px-6 py-4">
          <p className="text-lg font-normal leading-[27px] text-white">Learning Objectives</p>
          <div className="mt-1 rounded border border-[#404040] bg-[#262626] px-1.5 py-2">
            <p className="text-[16px] text-[#737373]">Linked to page objectives above.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end border-b border-[#525252]">
            <div className="border-b-2 border-[#4CA6FF] px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[#F5F5F5]">
              Question
            </div>
            {["Answer key", "Hints", "Explanation", "Dynamic variables"].map((t) => (
              <button
                key={t}
                type="button"
                className="px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[#3B76D3] hover:text-[#4CA6FF]"
              >
                {t}
              </button>
            ))}
            <button type="button" className="ml-auto px-2 py-2 text-[#BAB8BF] hover:text-white" aria-label="More">
              <MoreHorizontal className="size-5" />
            </button>
          </div>
          <div className="rounded border border-[#D4D4D4] bg-[#2A2B2E] p-2">
            <p className="text-[16px] font-normal leading-8 text-[#F5F5F5]">{neu.question}</p>
          </div>
          <div className="space-y-4 pt-6">
            {merged.map((opt, oi) => (
              <div
                key={`${oi}-${opt.text}`}
                className={cn(
                  "relative flex min-h-[50px] items-stretch rounded bg-[#2A2B2E]",
                  opt.status === "added" && "ring-1 ring-[#4a7c2f]",
                  opt.status === "removed" && "opacity-70",
                )}
              >
                <div className="flex w-8 shrink-0 items-center justify-center">
                  <GripVertical className="size-3.5 text-[#737373]" aria-hidden />
                </div>
                <div className="flex w-8 shrink-0 items-center justify-center">
                  <span className="size-4 shrink-0 rounded-full border border-[#737373] bg-[#262626]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 py-2 pr-2">
                  <div
                    className={cn(
                      "rounded border px-2 py-1 text-[16px] font-normal leading-8 text-[#F5F5F5]",
                      "border-[#D4D4D4] bg-[#2A2B2E]",
                      opt.status === "added" && "border-[#5a9440]/70 bg-[#1f3d18]/40",
                      opt.status === "removed" && "border-[#a34a4a]/60 line-through opacity-90",
                    )}
                  >
                    {opt.text}
                  </div>
                </div>
                <div className="flex w-12 shrink-0 items-center justify-center">
                  <X className="size-4 text-[#F5F5F5]" aria-hidden />
                </div>
                {opt.status === "added" ? (
                  <span className="absolute -right-1 -top-2 rounded bg-[#3d6b28] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#e8ffc8]">
                    New
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" className="pl-8 pt-2 text-left text-[16px] leading-6 text-[#3B76D3] hover:underline">
            Add choice
          </button>
        </div>
    </div>
  );
}

function MultipleChoiceQuestionCard(props: { neu: QuizQuestion; merged: ReturnType<typeof mergedAnswers> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#404040] bg-[#2A2B2E] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <MultipleChoiceQuestionInner {...props} />
    </div>
  );
}

function CheckAllThatApplyStaticPreview() {
  const choices = ["Add composted manure", "Apply a balanced 10-10-10 fertilizer", "Increase watering frequency", "Add iron foliar spray"];
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-[#404040] bg-[#2A2B2E] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="space-y-5 px-5 pb-8 pt-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-transparent pb-1">
          <div className="flex flex-wrap items-end gap-2">
            <h3 className="text-2xl font-normal leading-9 text-white">Check All That Apply</h3>
            <span className="cursor-default rounded-sm px-2 py-1 text-[14px] text-[#3B76D3]">Edit Title</span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded-sm p-3 text-[#3B76D3] hover:bg-white/5" aria-label="Duplicate">
              <Copy className="size-4" strokeWidth={2} />
            </button>
            <button type="button" className="rounded-sm p-2 text-white hover:bg-white/5" aria-label="Delete">
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="rounded-md border border-[#404040] bg-[#3E3F44] px-6 py-4">
          <p className="text-lg font-normal leading-[27px] text-white">Learning Objectives</p>
          <div className="mt-1 rounded border border-[#404040] bg-[#262626] px-1.5 py-2">
            <p className="text-[16px] text-[#737373]">Select or Create learning objectives...</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end border-b border-[#525252]">
            <div className="border-b-2 border-[#4CA6FF] px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[#F5F5F5]">
              Question
            </div>
            {["Answer key", "Hints", "Explanation", "Dynamic variables"].map((t) => (
              <button
                key={t}
                type="button"
                className="px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[#3B76D3] hover:text-[#4CA6FF]"
              >
                {t}
              </button>
            ))}
            <button type="button" className="ml-auto px-2 py-2 text-[#BAB8BF] hover:text-white" aria-label="More">
              <MoreHorizontal className="size-5" />
            </button>
          </div>
          <div className="rounded border border-[#D4D4D4] bg-[#2A2B2E] p-2">
            <p className="text-[16px] font-normal leading-8 text-[#F5F5F5]">
              Which of the following actions would help address the deficiency?
            </p>
          </div>
          <div className="space-y-4 pt-6">
            {choices.map((text, oi) => (
              <div key={oi} className="relative flex min-h-[50px] items-stretch rounded bg-[#2A2B2E]">
                <div className="flex w-8 shrink-0 items-center justify-center">
                  <GripVertical className="size-3.5 text-[#737373]" aria-hidden />
                </div>
                <div className="flex w-8 shrink-0 items-center justify-center">
                  <span className="size-4 shrink-0 rounded border border-[#737373] bg-[#262626]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 py-2 pr-2">
                  <div className="rounded border border-[#D4D4D4] bg-[#2A2B2E] px-2 py-1 text-[16px] font-normal leading-8 text-[#F5F5F5]">
                    {text}
                  </div>
                </div>
                <div className="flex w-12 shrink-0 items-center justify-center">
                  <X className="size-4 text-[#F5F5F5]" aria-hidden />
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="pl-8 pt-2 text-left text-[16px] leading-6 text-[#3B76D3] hover:underline">
            Add choice
          </button>
        </div>
      </div>
    </div>
  );
}

function buildChangeList(page: PageChange): ChangeListEntry[] {
  const entries: ChangeListEntry[] = [];
  const metaTrail = page.breadcrumb.slice(0, -1).join(" › ") || "Page";

  page.learningObjectives.forEach((lo, idx) => {
    const k = loStatusToKind(lo.status);
    if (!k) return;
    entries.push({
      id: `lo-${idx}`,
      kind: k,
      label: `Learning objective ${idx + 1}`,
      meta: metaTrail,
      scrollTargetId: `diff-lo-${idx}`,
    });
  });

  const n = Math.max(page.currentQuestions.length, page.newQuestions.length);
  for (let i = 0; i < n; i++) {
    const cur = page.currentQuestions[i] ?? { question: "", answers: [] };
    const neu = page.newQuestions[i] ?? { question: "", answers: [] };
    const kind = questionChangeKind(cur, neu);
    if (!kind) continue;
    const qLabel = page.newQuestions.length > 1 ? `Question ${i + 1}` : "Quiz";
    let label = qLabel;
    if (kind === "added") {
      const addedCount = neu.answers.filter(
        (a) => a.status === "added" || !cur.answers.some((c) => c.text === a.text),
      ).length;
      label = addedCount > 0 ? `${qLabel} — ${addedCount} new answer choice${addedCount === 1 ? "" : "es"}` : `${qLabel} (new)`;
    } else if (kind === "removed") {
      label = `${qLabel} — removed options`;
    } else if (cur.question.trim() !== neu.question.trim()) {
      label = `${qLabel} — prompt updated`;
    } else {
      label = `${qLabel} — updated`;
    }
    entries.push({
      id: `q-${i}`,
      kind,
      label,
      meta: page.breadcrumb[page.breadcrumb.length - 1] ?? page.title,
      scrollTargetId: `diff-q-${i}`,
    });
  }

  return entries;
}

function pageStats(page: PageChange) {
  let added = 0;
  let edited = 0;
  let removed = 0;
  for (const lo of page.learningObjectives) {
    const k = loStatusToKind(lo.status);
    if (k === "added") added++;
    else if (k === "edited") edited++;
    else if (k === "removed") removed++;
  }
  const n = Math.max(page.currentQuestions.length, page.newQuestions.length);
  for (let i = 0; i < n; i++) {
    const cur = page.currentQuestions[i] ?? { question: "", answers: [] };
    const neu = page.newQuestions[i] ?? { question: "", answers: [] };
    const k = questionChangeKind(cur, neu);
    if (k === "added") added++;
    else if (k === "edited") edited++;
    else if (k === "removed") removed++;
  }
  return { added, edited, removed };
}

type TextRowKind = "same" | "change" | "del" | "add";

function simpleLineDiff(current: string, next: string): Array<{ kind: TextRowKind; old?: string; neu?: string }> {
  const a = current.split("\n");
  const b = next.split("\n");
  const rows: Array<{ kind: TextRowKind; old?: string; neu?: string }> = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i >= a.length) {
      rows.push({ kind: "add", neu: b[j++] });
      continue;
    }
    if (j >= b.length) {
      rows.push({ kind: "del", old: a[i++] });
      continue;
    }
    if (a[i] === b[j]) {
      rows.push({ kind: "same", old: a[i], neu: b[j] });
      i++;
      j++;
    } else {
      rows.push({ kind: "change", old: a[i], neu: b[j] });
      i++;
      j++;
    }
  }
  return rows;
}

function textDiffChangeKind(rows: ReturnType<typeof simpleLineDiff>): ChangeKind | null {
  let hasAdd = false;
  let hasDel = false;
  let hasCh = false;
  for (const r of rows) {
    if (r.kind === "add") hasAdd = true;
    if (r.kind === "del") hasDel = true;
    if (r.kind === "change") hasCh = true;
  }
  if (hasDel && !hasAdd && !hasCh) return "removed";
  if (hasAdd && !hasDel && !hasCh) return "added";
  if (hasCh || hasAdd || hasDel) return "edited";
  return null;
}

export function DiffViewModal({
  open,
  onOpenChange,
  pageName,
  changes,
  currentVersion = "",
  newVersion = "",
  onPublishChanges,
  onDiscardAll,
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
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);
  const [detailQuestionIndex, setDetailQuestionIndex] = useState<number | null>(null);

  const centerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setCurrentPageIndex(0);
      setViewMode("full");
      setFilter("all");
      setActiveChangeId(null);
      setDetailQuestionIndex(null);
    }
  }, [open]);

  useEffect(() => {
    setCurrentPageIndex((i) => (i >= pages.length ? 0 : i));
  }, [pages.length]);

  const selectedPage = pages[Math.min(currentPageIndex, pages.length - 1)] ?? pages[0];
  const totalPages = pages.length;
  const isFirstPage = currentPageIndex <= 0;
  const isLastPage = currentPageIndex >= totalPages - 1;

  const currentText = selectedPage.currentVersionText ?? currentVersion;
  const newText = selectedPage.newVersionText ?? newVersion;

  const hasQuizContent =
    selectedPage.learningObjectives.length > 0 ||
    selectedPage.currentQuestions.length > 0 ||
    selectedPage.newQuestions.length > 0;

  const lineRows = useMemo(() => simpleLineDiff(currentText, newText), [currentText, newText]);
  const textKind = useMemo(() => textDiffChangeKind(lineRows), [lineRows]);
  const hasTextDiff = !hasQuizContent && (currentText.trim().length > 0 || newText.trim().length > 0);

  const changeList = useMemo(() => {
    if (hasQuizContent) return buildChangeList(selectedPage);
    if (!hasTextDiff || !textKind) return [];
    return [
      {
        id: "text-body",
        kind: textKind,
        label: "Page text",
        meta: selectedPage.title,
        scrollTargetId: "diff-text-block",
      },
    ];
  }, [hasQuizContent, hasTextDiff, selectedPage, textKind]);

  const stats = useMemo(() => {
    const s = pageStats(selectedPage);
    if (hasQuizContent) return s;
    if (!textKind) return { added: 0, edited: 0, removed: 0 };
    return {
      added: textKind === "added" ? 1 : 0,
      edited: textKind === "edited" ? 1 : 0,
      removed: textKind === "removed" ? 1 : 0,
    };
  }, [hasQuizContent, selectedPage, textKind]);

  const filteredChangeList = useMemo(() => {
    if (filter === "all") return changeList;
    return changeList.filter((c) => c.kind === filter);
  }, [changeList, filter]);

  const shouldShowLearningObjectives = useMemo(() => {
    if (!selectedPage.learningObjectives.length) return false;
    if (viewMode === "full") return true;
    return selectedPage.learningObjectives.some((lo) => {
      const k = loStatusToKind(lo.status);
      if (!k) return false;
      return filter === "all" || k === filter;
    });
  }, [selectedPage.learningObjectives, viewMode, filter]);

  useEffect(() => {
    if (!activeChangeId) return;
    if (!filteredChangeList.some((c) => c.id === activeChangeId)) {
      setActiveChangeId(filteredChangeList[0]?.id ?? null);
    }
  }, [activeChangeId, filteredChangeList]);

  const scrollToTarget = useCallback((targetId: string) => {
    const root = centerScrollRef.current;
    if (!root) return;
    const el = root.querySelector(`#${CSS.escape(targetId)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLElement) {
      el.style.transition = "box-shadow 0.3s";
      el.style.boxShadow = "0 0 0 2px rgba(99, 153, 34, 0.55)";
      window.setTimeout(() => {
        el.style.boxShadow = "";
      }, 1200);
    }
  }, []);

  const goToPreviousPage = () => {
    if (!isFirstPage) setCurrentPageIndex((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (!isLastPage) setCurrentPageIndex((prev) => prev + 1);
  };

  const breadcrumbTrail = selectedPage.breadcrumb;
  const breadcrumbTitle = breadcrumbTrail[breadcrumbTrail.length - 1] ?? selectedPage.title;

  const showRightActions = Boolean(onPublishChanges || onDiscardAll);

  const navButtonClass = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-[#525252] bg-[#262626] text-[#2B8BFE] transition-all outline-none",
    "hover:border-[#3B76D3] hover:bg-[#2A2B2E]",
    "focus-visible:ring-2 focus-visible:ring-[#3B76D3]/40",
    "disabled:pointer-events-none disabled:opacity-35",
  );

  const badgeClass = (kind: ChangeKind) =>
    cn(
      "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
      kind === "added" && "bg-[#3d6b28] text-[#060806] ring-1 ring-[#5a9440]/55",
      kind === "edited" && "bg-[#8a6218] text-[#0c0902] ring-1 ring-[#c78a2a]/40",
      kind === "removed" && "bg-[#6b2f2f] text-[#0a0404] ring-1 ring-[#a34a4a]/45",
    );

  const sectionBorder = (kind: ChangeKind | "none", highlighted: boolean) =>
    cn(
      "overflow-hidden rounded-lg border border-[#404040] transition-shadow",
      kind === "none" && "border-[#404040]",
      highlighted && kind === "added" && cn("border-[#639922]/45", "shadow-[0_0_0_1px_rgba(99,153,34,0.25)]"),
      highlighted && kind === "edited" && cn("border-[#ef9f27]/45", "shadow-[0_0_0_1px_rgba(239,159,39,0.2)]"),
      highlighted && kind === "removed" && cn("border-[#e24b4a]/35"),
    );

  const renderTextRows = (mode: ViewMode) => (
    <div id="diff-text-block" className={sectionBorder(textKind ?? "none", Boolean(textKind))}>
      {textKind ? (
        <div
          className={cn(
            "flex items-center justify-between border-b border-[#404040] px-3 py-2 text-[11px] font-medium",
            textKind === "added" && "bg-[#639922]/12 text-[#97c459]",
            textKind === "edited" && "bg-[#ef9f27]/10 text-[#ef9f27]",
            textKind === "removed" && "bg-[#e24b4a]/12 text-[#f09595]",
          )}
        >
          <span>
            {textKind === "added" && "Added — page text"}
            {textKind === "edited" && "Edited — page text"}
            {textKind === "removed" && "Removed — page text"}
          </span>
        </div>
      ) : null}
      <div className={cn("space-y-0.5 p-4 font-[family-name:var(--font-family-open)]", torus.inner)}>
        {lineRows.map((row, idx) => {
          if (mode === "diff" && row.kind === "same") return null;
          if (row.kind === "same") {
            return (
              <p key={idx} className={cn("pl-2 text-[13px] leading-relaxed", torus.prose)}>
                <span className="mr-2 select-none font-mono text-[11px] text-white/25">{idx + 1}</span>
                {row.neu || " "}
              </p>
            );
          }
          if (row.kind === "del") {
            return (
              <p
                key={idx}
                className={cn("rounded px-2 py-1 text-[13px] leading-relaxed line-through", torus.removedBg, torus.removed)}
              >
                <span className="mr-2 select-none font-mono text-[11px] text-white/25">{idx + 1}</span>
                {row.old || " "}
              </p>
            );
          }
          if (row.kind === "add") {
            return (
              <p key={idx} className={cn("rounded px-2 py-1 text-[13px] leading-relaxed", "bg-[#639922]/15", torus.added)}>
                <span className="mr-2 select-none font-mono text-[11px] text-white/25">{idx + 1}</span>
                {row.neu || " "}
              </p>
            );
          }
          return (
            <div key={idx} className="space-y-1 rounded border border-white/[0.06] bg-black/20 px-2 py-2">
              <p className={cn("text-[13px] leading-relaxed line-through", torus.removed)}>
                <span className="mr-2 select-none font-mono text-[11px] text-white/25">{idx + 1}</span>
                {row.old || " "}
              </p>
              <p className={cn("text-[13px] leading-relaxed", torus.added)}>
                <span className="mr-2 select-none font-mono text-[11px] text-white/25">{idx + 1}</span>
                {row.neu || " "}
              </p>
            </div>
          );
        })}
      </div>
      </div>
    );

  const renderDetailOverlay = () => {
    if (detailQuestionIndex === null || !hasQuizContent) return null;
    const cur = selectedPage.currentQuestions[detailQuestionIndex];
    const neu = selectedPage.newQuestions[detailQuestionIndex];
    if (!cur || !neu) return null;

    return (
      <div className={cn("absolute inset-0 z-[60] flex flex-col", torus.shell)} role="dialog" aria-modal="true" aria-label="Detailed comparison">
        <div className={cn("flex items-center justify-between border-b border-[#404040] bg-[#262626] px-4 py-3")}>
          <span className="text-sm font-medium text-[#EEEBF5]">Side-by-side: question {detailQuestionIndex + 1}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[#BAB8BF] hover:bg-white/10 hover:text-white"
            onClick={() => setDetailQuestionIndex(null)}
          >
            <X className="size-4" />
            Close detail
          </Button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-0 border-b border-[#404040]">
          <div className="flex min-h-0 flex-col border-r border-[#404040]">
            <div className={cn("border-b border-[#525252] px-3 py-2 text-[11px] font-medium", torus.removedBg, torus.removed)}>
              Current
            </div>
            <ScrollArea className="min-h-0 flex-1 bg-[#2A2B2E]">
              <div className="p-4">
                <p className="mb-3 text-sm text-[#F5F5F5]">{cur.question}</p>
                <ul className="space-y-2">
                  {cur.answers.map((a, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded border px-3 py-2 text-sm",
                        a.status === "removed" || !neu.answers.some((n) => n.text === a.text)
                          ? cn(torus.removedBg, "border-[#525252] line-through", torus.removed)
                          : "border-[#525252] text-[#D4D4D4]",
                      )}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#737373] opacity-90" />
                      {a.text}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-[#525252] bg-[#1f3d18] px-3 py-2 text-[11px] font-medium text-[#c8f5a8]">New</div>
            <ScrollArea className="min-h-0 flex-1 bg-[#2A2B2E]">
              <div className="p-4">
                <p className="mb-3 text-sm text-[#F5F5F5]">{neu.question}</p>
                <ul className="space-y-2">
                  {neu.answers.map((a, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded border px-3 py-2 text-sm",
                        a.status === "added" || !cur.answers.some((c) => c.text === a.text)
                          ? cn("border-[#4a7c2f]/50 bg-[#1f3d18]/80", torus.added)
                          : "border-[#525252] text-[#D4D4D4]",
                      )}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current opacity-80" />
                      {a.text}
                      {a.status === "added" ? (
                        <Badge className="ml-auto border-0 bg-[#3d6b28]/40 text-[10px] text-[#c8f5a8]">Added</Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[92vh] !max-w-[min(96vw,1680px)] w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-none",
          torus.shell,
          "border-white/[0.08] text-white shadow-2xl",
          "[&>button[data-slot]]:top-3 [&>button[data-slot]]:right-3 [&>button[data-slot]]:text-white/70 [&>button[data-slot]]:hover:bg-white/10 [&>button[data-slot]]:hover:text-white",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Review changes</DialogTitle>
          <DialogDescription>Compare updates in full-page context or diff-only mode.</DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Left: change list */}
          <aside
            className={cn(
              "flex w-full shrink-0 flex-col border-b border-[#404040] bg-[#262626] lg:w-[260px] lg:border-r lg:border-b-0",
            )}
          >
            <div className="border-b border-[#404040] px-4 py-3.5">
              <p className="text-[13px] font-medium text-[#EEEBF5]">Changes to review</p>
              <p className="mt-1 text-[11px] text-[#A3A3A3]">{selectedPage.title}</p>
            </div>
            <ScrollArea className="min-h-[140px] max-h-[28vh] flex-1 lg:max-h-none">
              <div className="p-2">
                {filteredChangeList.length === 0 ? (
                  <p className="px-2 py-4 text-center text-[12px] text-white/40">No changes match this filter.</p>
                ) : (
                  filteredChangeList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveChangeId(item.id);
                        scrollToTarget(item.scrollTargetId);
                      }}
                      className={cn(
                        "mb-1 flex w-full flex-col rounded-md border border-transparent px-3 py-2.5 text-left transition-colors",
                        "hover:bg-white/[0.05]",
                        activeChangeId === item.id &&
                          "border-[#4a7c2f]/55 bg-[#1a2614]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className={badgeClass(item.kind)}>
                          {item.kind === "added" && "Added"}
                          {item.kind === "edited" && "Edited"}
                          {item.kind === "removed" && "Removed"}
                        </span>
          </div>
                      <span className="text-[12px] leading-snug text-white/70">{item.label}</span>
                      <span className="mt-1 text-[11px] text-white/30">{item.meta}</span>
                    </button>
                  ))
                )}
            </div>
            </ScrollArea>
            <div className="mt-auto flex gap-3 border-t border-[#404040] px-4 py-3">
              <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3]">
                <span className="size-2 rounded-full bg-[#97c459]" />
                Added
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3]">
                <span className="size-2 rounded-full bg-[#ef9f27]" />
                Edited
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3]">
                <span className="size-2 rounded-full bg-[#f09595]" />
                Removed
              </div>
            </div>
          </aside>

          {/* Center */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#404040] bg-[#262626] px-4 py-2.5">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-0 text-[14px] leading-6">
                {breadcrumbTrail.map((crumb, idx) => (
                  <span key={idx} className="flex min-w-0 items-center">
                    {idx > 0 && (
                      <span className="px-3 text-[#BAB8BF]" aria-hidden>
                        <ChevronRight className="size-3 shrink-0 -rotate-90 opacity-80" />
                      </span>
                    )}
                    <span
                      className={cn(
                        "truncate",
                        idx === breadcrumbTrail.length - 1 ? torus.crumbCurrent : torus.link,
                      )}
                    >
                      {crumb}
                    </span>
                  </span>
                ))}
                {totalPages > 1 ? (
                  <span className="ml-2 hidden items-center gap-1 sm:inline-flex">
                    <button type="button" className={navButtonClass} onClick={goToPreviousPage} disabled={isFirstPage} aria-label="Previous page">
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="tabular-nums text-white/50">
                      {currentPageIndex + 1}/{totalPages}
                    </span>
                    <button type="button" className={navButtonClass} onClick={goToNextPage} disabled={isLastPage} aria-label="Next page">
                      <ChevronRight className="size-4" />
                    </button>
                  </span>
                ) : null}
            </div>
              <div className="inline-flex rounded-md bg-white/[0.06] p-0.5" role="group" aria-label="View mode">
                <button
                  type="button"
                  onClick={() => setViewMode("full")}
                  className={cn(
                    "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                    viewMode === "full" ? "bg-white/10 text-white/90" : "text-white/45 hover:text-white/70",
                  )}
                >
                  Full page
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("diff")}
                  className={cn(
                    "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                    viewMode === "diff" ? "bg-white/10 text-white/90" : "text-white/45 hover:text-white/70",
                  )}
                >
                  Diff only
                </button>
              </div>
            </header>

            <div ref={centerScrollRef} className={cn("min-h-0 flex-1 overflow-y-auto px-7 pb-12 pt-1", torus.canvas)}>
              <div className="mx-auto w-full max-w-[1536px] font-[family-name:var(--font-family-open)]">
                {hasQuizContent ? (
                  <article className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="shrink-0 rounded bg-[#525252] px-3 py-2 text-center text-[12.8px] font-semibold leading-[12.8px] text-white">
                          Practice
                        </span>
                        <h1 className="min-w-0 text-2xl font-normal leading-9 text-white">{breadcrumbTitle}</h1>
                        <span className="cursor-default rounded-sm px-2 py-1 text-[14px] leading-5 text-[#3B76D3]">Edit Title</span>
                      </div>
                      <button
                        type="button"
                        className="flex shrink-0 items-center gap-2 rounded-sm bg-[#3B76D3] px-4 py-2 text-[14px] font-normal leading-5 text-white"
                      >
                        Preview
                      </button>
                    </div>

                    {shouldShowLearningObjectives ? (
                      <div
                        id="diff-lo-section"
                        className="rounded-md border border-[#404040] bg-[#3E3F44] px-6 py-4 shadow-[0_0_0_1px_#404040]"
                      >
                        <h2 className="text-lg font-normal leading-[27px] text-white">Learning Objectives</h2>
                        <div className="mt-1 rounded border border-[#404040] bg-[#262626] p-1.5">
                          <div className="flex flex-wrap gap-2">
                            {selectedPage.learningObjectives.map((lo, idx) => {
                              const k = loStatusToKind(lo.status);
                              if (viewMode === "diff") {
                                if (!k) return null;
                                if (filter !== "all" && k !== filter) return null;
                              }
                              return (
                                <div
                                  key={idx}
                                  id={`diff-lo-${idx}`}
                                  className={cn(
                                    "relative max-w-full rounded px-2 py-1 pl-2 pr-8 text-[16px] font-medium leading-4 text-white",
                                    k === "added" && "ring-2 ring-[#4a7c2f] ring-offset-1 ring-offset-[#262626]",
                                    !k && "bg-[#525252]",
                                    k === "added" && "bg-[#525252]",
                                    k === "removed" && "bg-[#3f2a2a] line-through opacity-80",
                                    k === "edited" && "bg-[#5a4a2a]",
                                  )}
                                >
                                  <span className="block pr-6">{lo.text}</span>
                                  <span
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] leading-none text-white/90"
                                    aria-hidden
                                  >
                                    ×
                                  </span>
                                  {k === "added" ? (
                                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[#b7dc7a]">
                                      Added
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {viewMode === "full" ? (
                      <>
                        <div className="mb-6 rounded-lg border border-[#404040] bg-[#2A2B2E] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                          <DiffCurriculumStaticContent pageTitle={breadcrumbTitle} />
                        </div>

                        <section className="rounded-lg p-1 outline outline-1 outline-offset-[-1px] outline-[#AAAAAA]">
                          <LbdToolbarRow />
                          <div className="overflow-hidden rounded-lg border border-[#404040] bg-[#2A2B2E] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                            <LearnByDoingStrip />
                            <div className="space-y-6 px-5 pb-8 pt-4 sm:px-8">
                              <ScenarioPreviewBlock />
                              {selectedPage.newQuestions.map((neu, qIdx) => {
                                const cur = selectedPage.currentQuestions[qIdx] ?? { question: "", answers: [] };
                                const qKind = questionChangeKind(cur, neu);
                                const isChanged = qKind !== null;
                                const merged = mergedAnswers(cur, neu);
                                const barLabel =
                                  qKind === "added"
                                    ? `Added — ${neu.question.slice(0, 52)}${neu.question.length > 52 ? "…" : ""}`
                                    : qKind === "removed"
                                      ? "Removed — answer options"
                                      : qKind === "edited"
                                        ? "Edited — quiz content"
                                        : "";

                                return (
                                  <div
                                    key={qIdx}
                                    id={`diff-q-${qIdx}`}
                                    className={cn(
                                      "space-y-2",
                                      isChanged &&
                                        "rounded-lg p-1 outline outline-2 outline-offset-[-1px] outline-[#4a7c2f] sm:p-1.5",
                                    )}
                                  >
                                    {isChanged ? (
                                      <div
                                        className={cn(
                                          "flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-[11px] font-semibold",
                                          qKind === "added" && "bg-[#1a2614] text-[#c8f0a4]",
                                          qKind === "edited" && "bg-[#2a2418] text-[#f5d08a]",
                                          qKind === "removed" && "bg-[#261414] text-[#f5c0c0]",
                                        )}
                                      >
                                        <span className="min-w-0 flex-1 truncate">{barLabel}</span>
                                        <button
                                          type="button"
                                          onClick={() => setDetailQuestionIndex(qIdx)}
                                          className="shrink-0 rounded border border-[#6aad4a]/60 bg-[#253920] px-2.5 py-1 text-[11px] font-medium text-[#d4f5bc] hover:bg-[#2f4a28]"
                                        >
                                          View detail
                                        </button>
                                      </div>
                                    ) : null}
                                    <MultipleChoiceQuestionCard neu={neu} merged={merged} />
                                  </div>
                                );
                              })}
                              <CheckAllThatApplyStaticPreview />
                            </div>
                          </div>
                        </section>
                      </>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {selectedPage.newQuestions.map((neu, qIdx) => {
                          const cur = selectedPage.currentQuestions[qIdx] ?? { question: "", answers: [] };
                          const qKind = questionChangeKind(cur, neu);
                          const isChanged = qKind !== null;
                          if (!isChanged) return null;
                          if (filter !== "all" && qKind !== filter) return null;

                          const merged = mergedAnswers(cur, neu);
                          const barLabel =
                            qKind === "added"
                              ? `Added — ${neu.question.slice(0, 52)}${neu.question.length > 52 ? "…" : ""}`
                              : qKind === "removed"
                                ? "Removed — answer options"
                                : qKind === "edited"
                                  ? "Edited — quiz content"
                                  : "";

                          const mcShell = (
                            <div className="overflow-hidden rounded-lg border border-[#404040] bg-[#2A2B2E] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                              <LearnByDoingStrip />
                              <MultipleChoiceQuestionInner neu={neu} merged={merged} />
                            </div>
                          );

                          return (
                            <section key={qIdx} id={`diff-q-${qIdx}`} className="rounded-lg p-1 outline outline-2 outline-offset-[-2px] outline-[#4a7c2f]">
                              <div
                                className={cn(
                                  "mb-2 flex flex-wrap items-center justify-between gap-2 rounded-t-md px-3 py-2 text-[11px] font-semibold",
                                  qKind === "added" && "bg-[#1a2614] text-[#c8f0a4]",
                                  qKind === "edited" && "bg-[#2a2418] text-[#f5d08a]",
                                  qKind === "removed" && "bg-[#261414] text-[#f5c0c0]",
                                )}
                              >
                                <span className="min-w-0 flex-1 truncate">{barLabel}</span>
                                <button
                                  type="button"
                                  onClick={() => setDetailQuestionIndex(qIdx)}
                                  className="shrink-0 rounded border border-[#6aad4a]/60 bg-[#253920] px-2.5 py-1 text-[11px] font-medium text-[#d4f5bc] hover:bg-[#2f4a28]"
                                >
                                  View detail
                                </button>
                              </div>
                              {mcShell}
                            </section>
                          );
                        })}
                      </div>
                    )}

                    {viewMode === "full" ? (
                      <>
                    <div className="flex flex-col gap-8 rounded-lg border border-[#173667] bg-[#2A2B2E] p-6 shadow-[0_0_0_1px_#173667]">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-normal leading-6 text-white">Notes</h2>
                          <span className="rounded bg-[#173667] px-2 py-1 text-[14px] font-bold leading-[14px] text-white">
                            Enabled
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className="rounded-sm border border-[#0165D9] bg-white px-3 py-2 text-[14px] text-[#0165D9]"
                          >
                            Archive
                          </button>
                          <button type="button" className="rounded-sm bg-[#262626] px-3 py-2 text-[14px] text-[#0165D9]">
                            Disable
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="flex cursor-default items-start gap-3 text-[16px] leading-6 text-white">
                          <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center bg-[#0165D9]">
                            <span className="size-2 bg-white" />
                          </span>
                          Allow posts to be visible without approval
                        </label>
                        <label className="flex cursor-default items-start gap-3 text-[16px] leading-6 text-white">
                          <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center bg-[#0165D9]">
                            <span className="size-2 bg-white" />
                          </span>
                          Allow anonymous posts
                        </label>
                      </div>
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex flex-wrap items-stretch justify-center gap-4 pt-2 sm:justify-between">
                        <div className="w-full max-w-[400px] flex-1 rounded-sm border border-[#E5E5E5] bg-[#262626] p-4 shadow-[1px_1px_6px_-2px_rgba(0,0,0,0.25)]">
                          <button
                            type="button"
                            disabled={isFirstPage}
                            onClick={goToPreviousPage}
                            className="flex w-full items-center gap-4 text-left disabled:opacity-40"
                          >
                            <ChevronLeft className="size-6 shrink-0 text-[#2B8BFE]" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="text-right text-[12.8px] leading-[19.2px] text-[#A3A3A3]">Previous</div>
                              <div className="text-right text-base leading-6 text-[#2B8BFE]">
                                {pages[Math.max(0, currentPageIndex - 1)]?.title ?? "—"}
                              </div>
                            </div>
                          </button>
                        </div>
                        <div className="hidden w-40 shrink-0 sm:block" aria-hidden />
                        <div className="w-full max-w-[400px] flex-1 rounded-sm border border-[#E5E5E5] bg-[#262626] p-4 shadow-[1px_1px_6px_-2px_rgba(0,0,0,0.25)]">
                          <button
                            type="button"
                            disabled={isLastPage}
                            onClick={goToNextPage}
                            className="flex w-full items-center gap-4 text-left disabled:opacity-40"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[12.8px] leading-[19.2px] text-[#A3A3A3]">Next</div>
                              <div className="text-base leading-6 text-[#2B8BFE]">
                                {pages[Math.min(totalPages - 1, currentPageIndex + 1)]?.title ?? "—"}
                              </div>
                            </div>
                            <ChevronRight className="size-6 shrink-0 text-[#2B8BFE]" aria-hidden />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <p className="text-[12.8px] leading-[19.2px] text-[#99CCFF]">Cookie Preferences</p>
                      </>
                    ) : null}
                  </article>
                ) : hasTextDiff ? (
                  !textKind || filter === "all" || filter === textKind ? (
                    <article className="rounded-lg border border-[#404040] bg-[#2A2B2E] p-6 sm:p-8">
                      <header className="mb-5 border-b border-[#525252] pb-4">
                        <h1 className="text-[1.35rem] font-medium leading-tight text-white/95 sm:text-2xl">{breadcrumbTitle}</h1>
                      </header>
                      {renderTextRows(viewMode)}
                    </article>
                  ) : (
                    <p className="py-12 text-center text-sm text-white/40">No changes match this filter.</p>
                  )
                ) : (
                  <p className="text-center text-sm text-white/40">No content to compare for this page.</p>
                )}
              </div>
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Compare pages"
                className="flex items-center justify-center gap-4 border-t border-[#404040] bg-[#262626] px-4 py-2.5 lg:hidden"
              >
                <button type="button" className={navButtonClass} onClick={goToPreviousPage} disabled={isFirstPage} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm tabular-nums text-white/60">
                  {currentPageIndex + 1} / {totalPages}
                </span>
                <button type="button" className={navButtonClass} onClick={goToNextPage} disabled={isLastPage} aria-label="Next page">
                  <ChevronRight className="size-4" />
                </button>
            </nav>
            ) : null}
          </div>

          {/* Right */}
          <aside className="flex w-full shrink-0 flex-col border-t border-[#404040] bg-[#262626] lg:w-[220px] lg:border-l lg:border-t-0">
            {showRightActions ? (
              <div className="space-y-2 border-b border-[#404040] px-3.5 py-3.5">
                {onPublishChanges ? (
                  <Button type="button" className={cn("h-9 w-full rounded-md border-0 text-[13px] font-medium", torus.publish)} onClick={onPublishChanges}>
                    Publish changes
                  </Button>
                ) : null}
                {onDiscardAll ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-md border-white/15 bg-transparent text-[12px] text-white/50 hover:bg-white/5"
                    onClick={onDiscardAll}
                  >
                    Discard all
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="flex-1 space-y-0 px-3.5 py-3">
              <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-white/35">Summary</p>
              <div className="space-y-0 border-b border-white/[0.05] pb-1">
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="text-white/45">Added</span>
                  <span className={cn("font-medium tabular-nums", torus.added)}>{stats.added}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="text-white/45">Edited</span>
                  <span className={cn("font-medium tabular-nums", torus.edited)}>{stats.edited}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="text-white/45">Removed</span>
                  <span className={cn("font-medium tabular-nums", torus.removed)}>{stats.removed}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="text-white/45">Pages in set</span>
                  <span className="font-medium tabular-nums text-white/70">{totalPages}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="text-white/45">Active changes</span>
                  <span className="font-medium tabular-nums text-white/70">{changeList.length}</span>
                </div>
              </div>
            </div>
            <div className="mt-auto border-t border-[#404040] px-3.5 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/35">Filter by</p>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "added", "edited", "removed"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] transition-colors",
                      "border border-white/12 text-white/50 hover:bg-white/[0.05]",
                      f === filter && f !== "all" && "border-[#639922]/40 bg-[#639922]/12 text-[#97c459]",
                      f === filter && f === "all" && "border-white/30 bg-white/[0.14] font-medium text-white",
                    )}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {renderDetailOverlay()}
      </DialogContent>
    </Dialog>
  );
}
