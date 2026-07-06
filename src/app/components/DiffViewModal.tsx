import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft, X, Pencil, Users, CirclePlus, CircleMinus, CornerDownRight, Eye, Lock } from "lucide-react";
import { cn } from "./ui/utils";
import { DiffCurriculumFullPageLayout, DiffCurriculumStaticContent } from "./DiffCurriculumStaticContent";

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
  /** Full-page curriculum preview without quiz blocks (text or hero image diff) */
  previewVariant?: "quiz" | "lecture-text" | "lecture-image";
  /** Lecture image diff: "after" is the new hero (e.g. added image) */
  heroImageBeforeSrc?: string | null;
  heroImageAfterSrc?: string | null;
}

type ChangeKind = "added" | "edited" | "removed";

/** Jump-flash ring color per change kind (DS: Added green / Edited orange / Removed red). */
const FLASH_RGBA: Record<ChangeKind, string> = {
  added: "rgba(57, 229, 129, 0.6)", // var(--ol-action-added)
  edited: "rgba(255, 144, 64, 0.6)", // var(--ol-diff-edited)
  removed: "rgba(255, 64, 64, 0.6)", // var(--ol-diff-removed)
};

/** Selected side-panel card fill/border per change kind, matching the legend (DS values). */
function activeCardAccent(kind: ChangeKind) {
  switch (kind) {
    case "added":
      return "border-[var(--ol-diff-added)]/55 bg-[var(--ol-diff-added)]/18";
    case "removed":
      return "border-[var(--ol-diff-removed)]/55 bg-[var(--ol-diff-removed-bg)]";
    case "edited":
    default:
      return "border-[var(--ol-diff-edited)]/55 bg-[var(--ol-diff-edited-bg)]";
  }
}

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
  /** Read-only banner copy. Defaults to the Course Author wording; Instructors pass their own. */
  previewNote?: string;
  /** When set, show primary actions in the right column (e.g. wire to publish flow). */
  onPublishChanges?: () => void;
  onDiscardAll?: () => void;
}

/** Figma export tokens (curriculum + chrome) */
const torus = {
  shell: "bg-[var(--ol-page-bg)]",
  panel: "bg-[var(--ol-card-bg)]",
  canvas: "bg-[var(--ol-page-bg)]",
  inner: "bg-[var(--ol-input-bg)]",
  hairline: "border-[var(--ol-border)]",
  link: "text-[var(--ol-link-strong)]",
  linkUi: "text-[var(--ol-link-strong)]",
  crumbCurrent: "text-[var(--ol-text)]",
  hair: "var(--ol-border)",
  prose: "text-[var(--ol-text)]",
  tableText: "text-[var(--ol-text-muted)]",
  added: "text-[var(--ol-action-added)]",
  addedBg: "bg-[var(--ol-diff-added)]/18",
  addedBorder: "border-[var(--ol-diff-added)]",
  edited: "text-[var(--ol-action-edited)]",
  editedBg: "bg-[var(--ol-diff-edited-bg)]",
  editedBorder: "border-[var(--ol-diff-edited)]/55",
  removed: "text-[var(--ol-action-removed)]",
  removedBg: "bg-[var(--ol-diff-removed-bg)]",
  publish: "bg-[#0062F2] hover:bg-[#0D70FF] text-white",
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
    <div className="flex items-center gap-3 bg-[var(--ol-panel)] px-8 py-4">
      <Pencil className="size-5 shrink-0 text-[var(--ol-text)]" strokeWidth={1.75} aria-hidden />
      <span className="text-[20px] font-semibold uppercase leading-5 tracking-tight text-[var(--ol-text)]">Learn by doing</span>
    </div>
  );
}

function LbdToolbarRow() {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-end gap-2 px-1 pt-0.5">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm border border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-2 py-1.5 text-[12px] text-[var(--ol-text-muted)]"
        aria-label="Collaborators"
      >
        <Users className="size-4" strokeWidth={1.75} />
        <ChevronRight className="size-3 rotate-90 opacity-70" aria-hidden />
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm border border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-2 py-1.5 text-[12px] text-[var(--ol-text)]/90"
      >
        Learn by doing
        <ChevronRight className="size-3 rotate-90 opacity-70" aria-hidden />
      </button>
    </div>
  );
}

function ScenarioPreviewBlock() {
  return (
    <div className="rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] px-6 py-5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <h3 className="text-xl font-normal leading-8 text-[var(--ol-text)]">Scenario: Yellowing Tomato Leaves</h3>
      <p className="mt-3 text-base leading-8 text-[var(--ol-text)]">
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
        <div className="border-b border-transparent pb-1">
          <h3 className="text-xl font-normal leading-8 text-[var(--ol-text)]">Multiple Choice</h3>
        </div>

        <div className="rounded-md border border-[var(--ol-border)] bg-[var(--ol-panel)] px-6 py-4">
          <p className="text-lg font-normal leading-[27px] text-[var(--ol-text)]">Learning Objectives</p>
          <div className="mt-1 rounded border border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-1.5 py-2">
            <p className="text-[16px] text-[var(--ol-text-muted)]">Linked to page objectives above.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end border-b border-[var(--ol-border)]">
            <div className="border-b-2 border-[var(--ol-link-strong)] px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[var(--ol-text)]">
              Question
            </div>
            {["Answer key", "Hints", "Explanation", "Dynamic variables"].map((t) => (
              <span
                key={t}
                className="px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[var(--ol-link-strong)]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="px-1 pt-1 text-[16px] font-normal leading-8 text-[var(--ol-text)]">{neu.question}</p>
          <ul className="space-y-3 pt-4">
            {merged.map((opt, oi) => (
              <li
                key={`${oi}-${opt.text}`}
                className={cn(
                  "relative flex items-center gap-3 rounded px-1",
                  opt.status === "removed" && "opacity-80",
                )}
              >
                <span className="size-4 shrink-0 rounded-full border border-[var(--ol-text-muted)] bg-[var(--ol-card-bg)]" aria-hidden />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[16px] font-normal leading-8",
                    opt.status === "added" ? "text-[var(--ol-action-added)]" : "text-[var(--ol-text)]",
                    opt.status === "removed" && "text-[var(--ol-action-removed)] line-through",
                  )}
                >
                  {opt.text}
                </span>
                {opt.status === "added" ? (
                  <span className="shrink-0 rounded bg-[var(--ol-diff-added)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    New
                  </span>
                ) : null}
                {opt.status === "removed" ? (
                  <span className="shrink-0 rounded bg-[var(--ol-diff-removed)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--ol-card-bg)]">
                    Removed
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}

function MultipleChoiceQuestionCard(props: { neu: QuizQuestion; merged: ReturnType<typeof mergedAnswers> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <MultipleChoiceQuestionInner {...props} />
    </div>
  );
}

function CheckAllThatApplyStaticPreview() {
  const choices = ["Add composted manure", "Apply a balanced 10-10-10 fertilizer", "Increase watering frequency", "Add iron foliar spray"];
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="space-y-5 px-5 pb-8 pt-6 sm:px-8">
        <div className="border-b border-transparent pb-1">
          <h3 className="text-xl font-normal leading-8 text-[var(--ol-text)]">Check All That Apply</h3>
        </div>
        <div className="rounded-md border border-[var(--ol-border)] bg-[var(--ol-panel)] px-6 py-4">
          <p className="text-lg font-normal leading-[27px] text-[var(--ol-text)]">Learning Objectives</p>
          <div className="mt-1 rounded border border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-1.5 py-2">
            <p className="text-[16px] text-[var(--ol-text-muted)]">Select or Create learning objectives...</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end border-b border-[var(--ol-border)]">
            <div className="border-b-2 border-[var(--ol-link-strong)] px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[var(--ol-text)]">
              Question
            </div>
            {["Answer key", "Hints", "Explanation", "Dynamic variables"].map((t) => (
              <span
                key={t}
                className="px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[var(--ol-link-strong)]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="px-1 pt-1 text-[16px] font-normal leading-8 text-[var(--ol-text)]">
            Which of the following actions would help address the deficiency?
          </p>
          <ul className="space-y-3 pt-4">
            {choices.map((text, oi) => (
              <li key={oi} className="relative flex items-center gap-3 rounded px-1">
                <span className="size-4 shrink-0 rounded border border-[var(--ol-text-muted)] bg-[var(--ol-card-bg)]" aria-hidden />
                <span className="min-w-0 flex-1 text-[16px] font-normal leading-8 text-[var(--ol-text)]">{text}</span>
              </li>
            ))}
          </ul>
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
      label = addedCount > 0 ? `${qLabel} — ${addedCount} new answer choice${addedCount === 1 ? "" : "s"}` : `${qLabel} (new)`;
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

  if (page.previewVariant === "lecture-image" && page.heroImageAfterSrc) {
    entries.push({
      id: "hero-image",
      kind: "added",
      label: "Hero image",
      meta: page.breadcrumb[page.breadcrumb.length - 1] ?? page.title,
      scrollTargetId: "diff-hero-image",
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
  if (page.previewVariant === "lecture-image" && page.heroImageAfterSrc) {
    added++;
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
  previewNote = "You're reviewing saved changes. Content can't be edited from this view.",
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
  // Full-page-in-context is the only diff view (the "View changes only" toggle was removed).
  const viewMode: ViewMode = "full";
  const [filter, setFilter] = useState<FilterKind>("all");
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);
  const [detailQuestionIndex, setDetailQuestionIndex] = useState<number | null>(null);
  const [detailLectureTextOpen, setDetailLectureTextOpen] = useState(false);

  const centerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setCurrentPageIndex(0);
      setFilter("all");
      setActiveChangeId(null);
      setDetailQuestionIndex(null);
      setDetailLectureTextOpen(false);
    }
  }, [open]);

  useEffect(() => {
    setCurrentPageIndex((i) => (i >= pages.length ? 0 : i));
  }, [pages.length]);

  const selectedPage = pages[Math.min(currentPageIndex, pages.length - 1)] ?? pages[0];
  const totalPages = pages.length;
  const isFirstPage = currentPageIndex <= 0;
  const isLastPage = currentPageIndex >= totalPages - 1;

  const isLecturePreview =
    selectedPage.previewVariant === "lecture-text" || selectedPage.previewVariant === "lecture-image";
  const hasQuizBlocks =
    selectedPage.currentQuestions.length > 0 || selectedPage.newQuestions.length > 0;

  const currentText = selectedPage.currentVersionText ?? currentVersion;
  const newText = selectedPage.newVersionText ?? newVersion;

  const hasQuizContent =
    selectedPage.learningObjectives.length > 0 ||
    selectedPage.currentQuestions.length > 0 ||
    selectedPage.newQuestions.length > 0;

  const lineRows = useMemo(() => simpleLineDiff(currentText, newText), [currentText, newText]);
  const textKind = useMemo(() => textDiffChangeKind(lineRows), [lineRows]);
  const legacyTextOnlyDiff = !hasQuizContent && (currentText.trim().length > 0 || newText.trim().length > 0);
  const hasTextDiff = legacyTextOnlyDiff;

  const changeList = useMemo(() => {
    if (!hasQuizContent) {
      if (!textKind) return [];
      return [
        {
          id: "text-body",
          kind: textKind,
          label: "Page text",
          meta: selectedPage.title,
          scrollTargetId: "diff-text-block",
        },
      ];
    }
    const list = buildChangeList(selectedPage);
    if (selectedPage.previewVariant === "lecture-text" && textKind && !list.some((e) => e.id === "text-body")) {
      return [
        ...list,
        {
          id: "text-body",
          kind: textKind,
          label: "Page text",
          meta: selectedPage.title,
          scrollTargetId: "diff-text-block",
        },
      ];
    }
    return list;
  }, [hasQuizContent, selectedPage, textKind]);

  const stats = useMemo(() => {
    if (!hasQuizContent) {
      if (!textKind) return { added: 0, edited: 0, removed: 0 };
      return {
        added: textKind === "added" ? 1 : 0,
        edited: textKind === "edited" ? 1 : 0,
        removed: textKind === "removed" ? 1 : 0,
      };
    }
    const s = pageStats(selectedPage);
    if (selectedPage.previewVariant === "lecture-text" && textKind) {
      if (textKind === "added") return { ...s, added: s.added + 1 };
      if (textKind === "edited") return { ...s, edited: s.edited + 1 };
      if (textKind === "removed") return { ...s, removed: s.removed + 1 };
    }
    return s;
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

  const scrollToTarget = useCallback((targetId: string, kind: ChangeKind = "added") => {
    const root = centerScrollRef.current;
    if (!root) return;
    const el = root.querySelector(`#${CSS.escape(targetId)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLElement) {
      el.style.transition = "box-shadow 0.3s";
      el.style.boxShadow = `0 0 0 2px ${FLASH_RGBA[kind]}`;
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
    "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-[var(--ol-border)] bg-[var(--ol-card-bg)] text-[var(--ol-link-strong)] transition-all outline-none",
    "hover:border-[var(--ol-link-strong)] hover:bg-[var(--ol-input-bg)]",
    "focus-visible:ring-2 focus-visible:ring-[var(--ol-link-strong)]",
    "disabled:pointer-events-none disabled:opacity-35",
  );

  const badgeClass = (kind: ChangeKind) =>
    cn(
      "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
      kind === "added" && "bg-[var(--ol-diff-added)] text-white ring-1 ring-[var(--ol-action-added)]/45",
      kind === "edited" && "bg-[var(--ol-diff-edited)] text-[var(--ol-card-bg)] ring-1 ring-[var(--ol-diff-edited)]/45",
      kind === "removed" && "bg-[var(--ol-diff-removed)] text-[var(--ol-card-bg)] ring-1 ring-[var(--ol-diff-removed)]/45",
    );

  /** Outline color for a changed block, keyed to the diff kind (added green / edited amber / removed red). */
  const kindOutlineClass = (kind: ChangeKind | null) =>
    cn(
      kind === "edited" && "outline-[var(--ol-diff-edited)]/55",
      kind === "removed" && "outline-[var(--ol-diff-removed)]/55",
      (kind === "added" || kind === null) && "outline-[var(--ol-diff-added)]",
    );

  /** "View detail" button styling tinted to the diff kind so it doesn't always read as "added". */
  const detailButtonClass = (kind: ChangeKind | null) =>
    cn(
      "shrink-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
      kind === "edited" && "border border-[var(--ol-diff-edited)]/55 bg-[var(--ol-diff-edited-bg)] text-[var(--ol-action-edited)] hover:bg-[var(--ol-diff-edited-bg)]/80",
      kind === "removed" && "border border-[var(--ol-diff-removed)]/55 bg-[var(--ol-diff-removed-bg)] text-[var(--ol-action-removed)] hover:bg-[var(--ol-diff-removed-bg)]/80",
      (kind === "added" || kind === null) &&
        "border border-[var(--ol-diff-added)]/60 bg-[var(--ol-diff-added)]/18 text-[var(--ol-action-added)] hover:bg-[var(--ol-diff-added)]/28",
    );

  /** Flowing page body: edits read as part of the lesson, not a detached editor. */
  const renderCurriculumInlineTextIntro = (mode: ViewMode) => {
    if (!textKind) return null;
    const prose = "text-base font-normal leading-8 text-[var(--ol-text)]";

    return (
      <div id="diff-text-block" className="mt-3 space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-white/[0.06] pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ol-text)]/40">Page body</span>
          <button
            type="button"
            onClick={() => {
              setDetailQuestionIndex(null);
              setDetailLectureTextOpen(true);
            }}
            className="text-[13px] font-medium text-[var(--ol-link)] underline-offset-2 hover:underline"
          >
            View full text comparison
          </button>
        </div>
        {lineRows.map((row, idx) => {
          if (mode === "diff" && row.kind === "same") return null;
          if (row.kind === "same") {
            const t = (row.neu ?? "").trim();
            if (!t) return <div key={idx} className="h-1" aria-hidden />;
            const isBullet = t.startsWith("-");
            return (
              <p key={idx} className={cn(prose, isBullet && "pl-1")}>
                {isBullet ? <span className="mr-2 text-[var(--ol-text-muted)]" aria-hidden>•</span> : null}
                {isBullet ? t.replace(/^-\s*/, "") : row.neu}
              </p>
            );
          }
          if (row.kind === "del") {
            return (
              <div key={idx} className="relative rounded pt-2 ring-1 ring-[var(--ol-diff-removed)]/75">
                <span className="absolute -right-0.5 -top-2 z-10 rounded bg-[var(--ol-diff-removed)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ol-card-bg)] shadow-sm ring-1 ring-[var(--ol-diff-removed)]/50">
                  Removed
                </span>
                <div className="rounded border border-[var(--ol-diff-removed)]/65 bg-[var(--ol-diff-removed-bg)] px-3 py-2.5">
                  <p className={cn("text-base leading-8 line-through", torus.removed)}>{row.old || " "}</p>
                </div>
              </div>
            );
          }
          if (row.kind === "add") {
            return (
              <div key={idx} className="relative rounded pt-2 ring-1 ring-[var(--ol-diff-added)]">
                <span className="absolute -right-0.5 -top-2 z-10 rounded bg-[var(--ol-diff-added)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-[var(--ol-diff-added)]/55">
                  New
                </span>
                <div className="rounded border border-[var(--ol-diff-added)]/70 bg-[var(--ol-diff-added)]/18 px-3 py-2.5">
                  <p className={cn("text-base leading-8", torus.added)}>{row.neu || " "}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={idx} className="relative rounded pt-2 ring-1 ring-[var(--ol-diff-edited)]/75">
              <span className="absolute -right-0.5 -top-2 z-10 rounded bg-[var(--ol-diff-edited)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ol-card-bg)] shadow-sm ring-1 ring-[var(--ol-diff-edited)]/45">
                Edited
              </span>
              <div className="rounded border border-[var(--ol-diff-edited)]/55 bg-[var(--ol-diff-edited-bg)]/70 px-3 py-2.5">
                <p className="text-base leading-8 text-[var(--ol-text)]">
                  <span className="text-[var(--ol-action-removed)] line-through decoration-[var(--ol-action-removed)]/90">{row.old || " "}</span>
                  <span className="mx-1.5 text-[var(--ol-text)]/25" aria-hidden>
                    →
                  </span>
                  <span className={cn(torus.added)}>{row.neu || " "}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const defaultCurriculumIntro = (
    <p className="mt-3 text-base font-normal leading-8 text-[var(--ol-text)]">
      Just like humans need a balanced diet to stay healthy, plants need a variety of nutrients to grow, reproduce, and
      resist disease. These nutrients are mostly absorbed from the soil through the plant&apos;s roots and play specific roles
      in development. When a plant lacks one or more key nutrients, it often shows visible symptoms such as yellow leaves,
      stunted growth, or poor flowering.
    </p>
  );

  const renderLecturePageTextPanel = (mode: ViewMode) => {
    if (!textKind) return null;
    const outlineClass =
      textKind === "added"
        ? "rounded-lg p-1 outline outline-2 outline-offset-[-1px] outline-[var(--ol-diff-added)] sm:p-1.5"
        : textKind === "removed"
          ? "rounded-lg p-1 outline outline-2 outline-offset-[-1px] outline-[var(--ol-diff-removed)]/55 sm:p-1.5"
          : "rounded-lg p-1 outline outline-2 outline-offset-[-1px] outline-[var(--ol-diff-edited)]/55 sm:p-1.5";
    const barLabel =
      textKind === "added" ? "Added — page text" : textKind === "removed" ? "Removed — page text" : "Edited — page text";

    return (
      <div id="diff-text-block" className={cn("space-y-2", outlineClass)}>
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-[11px] font-semibold",
            textKind === "added" && "bg-[var(--ol-diff-added)]/18 text-[var(--ol-action-added)]",
            textKind === "edited" && "bg-[var(--ol-diff-edited-bg)] text-[var(--ol-action-edited)]",
            textKind === "removed" && "bg-[var(--ol-diff-removed-bg)] text-[var(--ol-action-removed)]",
          )}
        >
          <span className="min-w-0 flex-1 truncate">{barLabel}</span>
          <button
            type="button"
            onClick={() => {
              setDetailQuestionIndex(null);
              setDetailLectureTextOpen(true);
            }}
            className={detailButtonClass(textKind)}
          >
            View detail
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
          <div className="space-y-5 px-5 pb-8 pt-6 sm:px-8">
            <div className="border-b border-transparent pb-1">
              <h3 className="text-xl font-normal leading-8 text-[var(--ol-text)]">Page text</h3>
            </div>

            <div className="flex flex-wrap items-end border-b border-[var(--ol-border)]">
              <div className="border-b-2 border-[var(--ol-link-strong)] px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[var(--ol-text)]">
                Content
              </div>
              {["Settings", "History"].map((t) => (
                <span
                  key={t}
                  className="px-3 pb-2.5 pt-2 text-center text-[14px] font-medium uppercase leading-[17.5px] text-[var(--ol-link-strong)]"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="rounded border border-[var(--ol-text-muted)] bg-[var(--ol-input-bg)] p-4">
              <div className="space-y-4 font-[family-name:var(--font-family-open)]">
                {lineRows.map((row, idx) => {
                  if (mode === "diff" && row.kind === "same") return null;
                  if (row.kind === "same") {
                    const t = (row.neu ?? "").trim();
                    if (!t) return <div key={idx} className="h-2" />;
                    return (
                      <p key={idx} className="text-[16px] font-normal leading-8 text-[var(--ol-text)]">
                        {row.neu}
                      </p>
                    );
                  }
                  if (row.kind === "del") {
                    return (
                      <div key={idx} className="relative rounded pt-2 ring-1 ring-[var(--ol-diff-removed)]/75">
                        <span className="absolute -right-0.5 -top-2 z-10 rounded bg-[var(--ol-diff-removed)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ol-card-bg)] shadow-sm ring-1 ring-[var(--ol-diff-removed)]/50">
                          Removed
                        </span>
                        <div className="rounded border border-[var(--ol-diff-removed)]/65 bg-[var(--ol-diff-removed-bg)] px-3 py-2.5">
                          <p className={cn("text-[16px] font-normal leading-8 line-through", torus.removed)}>{row.old || " "}</p>
                        </div>
                      </div>
                    );
                  }
                  if (row.kind === "add") {
                    return (
                      <div key={idx} className="relative rounded pt-2 ring-1 ring-[var(--ol-diff-added)]">
                        <span className="absolute -right-0.5 -top-2 z-10 rounded bg-[var(--ol-diff-added)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-[var(--ol-diff-added)]/55">
                          New
                        </span>
                        <div className="rounded border border-[var(--ol-diff-added)]/70 bg-[var(--ol-diff-added)]/18 px-3 py-2.5">
                          <p className={cn("text-[16px] font-normal leading-8", torus.added)}>{row.neu || " "}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="relative rounded pt-2 ring-1 ring-[var(--ol-diff-edited)]/75">
                      <span className="absolute -right-0.5 -top-2 z-10 rounded bg-[var(--ol-diff-edited)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ol-card-bg)] shadow-sm ring-1 ring-[var(--ol-diff-edited)]/45">
                        Edited
                      </span>
                      <div className="rounded border border-[var(--ol-diff-edited)]/55 bg-[var(--ol-diff-edited-bg)]/70 px-3 py-2.5">
                        <p className="text-[16px] font-normal leading-8 text-[var(--ol-text)]">
                          <span className={cn("line-through", torus.removed)}>{row.old || " "}</span>
                          <span className="mx-1.5 text-[var(--ol-text)]/25" aria-hidden>
                            →
                          </span>
                          <span className={cn(torus.added)}>{row.neu || " "}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailOverlay = () => {
    if (detailQuestionIndex === null || !hasQuizBlocks) return null;
    const cur = selectedPage.currentQuestions[detailQuestionIndex];
    const neu = selectedPage.newQuestions[detailQuestionIndex];
    if (!cur || !neu) return null;

    return (
      <div className={cn("absolute inset-0 z-[60] flex flex-col", torus.shell)} role="dialog" aria-modal="true" aria-label="Detailed comparison">
        <div className={cn("flex items-center justify-between border-b border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-4 py-3")}>
          <span className="text-sm font-medium text-[var(--ol-text)]">Side-by-side: question {detailQuestionIndex + 1}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[var(--ol-text-muted)] hover:bg-white/10 hover:text-[var(--ol-text)]"
            onClick={() => {
              setDetailQuestionIndex(null);
              setDetailLectureTextOpen(false);
            }}
          >
            <X className="size-4" />
            Close detail
          </Button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-0 border-b border-[var(--ol-border)]">
          <div className="flex min-h-0 flex-col border-r border-[var(--ol-border)]">
            <div className={cn("border-b border-[var(--ol-border)] px-3 py-2 text-[11px] font-medium", torus.removedBg, torus.removed)}>
              Current
            </div>
            <ScrollArea className="min-h-0 flex-1 bg-[var(--ol-input-bg)]">
              <div className="p-4">
                <p className="mb-3 text-sm text-[var(--ol-text)]">{cur.question}</p>
                <ul className="space-y-2">
                  {cur.answers.map((a, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded border px-3 py-2 text-sm",
                        a.status === "removed" || !neu.answers.some((n) => n.text === a.text)
                          ? cn(torus.removedBg, "border-[var(--ol-border)] line-through", torus.removed)
                          : "border-[var(--ol-border)] text-[var(--ol-text-muted)]",
                      )}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--ol-text-muted)] opacity-90" />
                      {a.text}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-[var(--ol-border)] bg-[var(--ol-diff-added)]/18 px-3 py-2 text-[11px] font-medium text-[var(--ol-action-added)]">New</div>
            <ScrollArea className="min-h-0 flex-1 bg-[var(--ol-input-bg)]">
              <div className="p-4">
                <p className="mb-3 text-sm text-[var(--ol-text)]">{neu.question}</p>
                <ul className="space-y-2">
                  {neu.answers.map((a, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded border px-3 py-2 text-sm",
                        a.status === "added" || !cur.answers.some((c) => c.text === a.text)
                          ? cn("border-[var(--ol-diff-added)]/50 bg-[var(--ol-diff-added)]/18", torus.added)
                          : "border-[var(--ol-border)] text-[var(--ol-text-muted)]",
                      )}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current opacity-80" />
                      {a.text}
                      {a.status === "added" ? (
                        <Badge className="ml-auto border-0 bg-[var(--ol-diff-added)] text-[10px] text-white">Added</Badge>
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

  const renderLectureTextDetailOverlay = () => {
    if (!detailLectureTextOpen || !textKind) return null;
    if (!currentText.trim() && !newText.trim()) return null;

    return (
      <div
        className={cn("absolute inset-0 z-[60] flex flex-col", torus.shell)}
        role="dialog"
        aria-modal="true"
        aria-label="Page text side-by-side comparison"
      >
        <div className={cn("flex items-center justify-between border-b border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-4 py-3")}>
          <span className="text-sm font-medium text-[var(--ol-text)]">Side-by-side: page text</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[var(--ol-text-muted)] hover:bg-white/10 hover:text-[var(--ol-text)]"
            onClick={() => setDetailLectureTextOpen(false)}
          >
            <X className="size-4" />
            Close detail
          </Button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-0 border-b border-[var(--ol-border)]">
          <div className="flex min-h-0 flex-col border-r border-[var(--ol-border)]">
            <div className={cn("border-b border-[var(--ol-border)] px-3 py-2 text-[11px] font-medium", torus.removedBg, torus.removed)}>
              Current
            </div>
            <ScrollArea className="min-h-0 flex-1 bg-[var(--ol-input-bg)]">
              <pre className="whitespace-pre-wrap break-words p-4 font-[family-name:var(--font-family-open)] text-[14px] leading-relaxed text-[var(--ol-text-muted)]">
                {currentText}
              </pre>
            </ScrollArea>
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-[var(--ol-border)] bg-[var(--ol-diff-added)]/18 px-3 py-2 text-[11px] font-medium text-[var(--ol-action-added)]">New</div>
            <ScrollArea className="min-h-0 flex-1 bg-[var(--ol-input-bg)]">
              <pre className="whitespace-pre-wrap break-words p-4 font-[family-name:var(--font-family-open)] text-[14px] leading-relaxed text-[var(--ol-text-muted)]">
                {newText}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          /* Do not use `relative` here — it overrides Radix's `fixed` via tailwind-merge and portals the panel below the viewport (only the dimmed overlay is visible). */
          "flex h-[92vh] !max-w-[min(96vw,1680px)] w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-none",
          torus.shell,
          "border-white/[0.08] text-[var(--ol-text)] shadow-2xl",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Review changes</DialogTitle>
          <DialogDescription>Compare updates in full-page context.</DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Left: change list */}
          <aside
            className={cn(
              "flex w-full shrink-0 flex-col border-b border-[var(--ol-border)] bg-[var(--ol-card-bg)] lg:w-[260px] lg:border-r lg:border-b-0",
            )}
          >
            <div className="border-b border-[var(--ol-border)] px-4 py-3">
              <p className="text-[13px] font-medium text-[var(--ol-text)]">Changes to review</p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--ol-text-muted)]" title={selectedPage.title}>
                {selectedPage.title}
              </p>
            </div>
            <ScrollArea className="min-h-[140px] max-h-[28vh] flex-1 lg:max-h-none [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-full">
              <div className="p-2">
                {filteredChangeList.length === 0 ? (
                  <p className="px-2 py-4 text-center text-[12px] text-[var(--ol-text)]/40">No changes match this filter.</p>
                ) : (
                  filteredChangeList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveChangeId(item.id);
                        scrollToTarget(item.scrollTargetId, item.kind);
                      }}
                      aria-label={`Jump to ${item.label} in the page`}
                      title="Jump to section"
                      className={cn(
                        "group mb-1 flex w-full flex-col gap-0.5 rounded-md border px-2.5 py-2 text-left outline-none transition-colors",
                        "border-[var(--ol-border)] bg-transparent hover:border-[var(--ol-link-strong)]/60 hover:bg-[var(--ol-text)]/[0.04]",
                        "focus-visible:ring-2 focus-visible:ring-[var(--ol-link-strong)]",
                        activeChangeId === item.id &&
                          cn(activeCardAccent(item.kind), "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"),
                      )}
                    >
                      <span className={cn(badgeClass(item.kind), "self-start")}>
                        {item.kind === "added" && "Added"}
                        {item.kind === "edited" && "Edited"}
                        {item.kind === "removed" && "Removed"}
                      </span>
                      <span className="text-[12.5px] font-medium leading-snug text-[var(--ol-text)]/85">{item.label}</span>
                      <span className="truncate text-[11px] leading-snug text-[var(--ol-text-muted)]" title={item.meta}>
                        {item.meta}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 flex items-center gap-1 text-[11px] font-medium transition-colors",
                          "text-[var(--ol-text-muted)] group-hover:text-[var(--ol-link)] group-focus-visible:text-[var(--ol-link)]",
                          activeChangeId === item.id && "text-[var(--ol-link)]",
                        )}
                      >
                        <CornerDownRight className="size-3 shrink-0" aria-hidden />
                        Jump to section
                      </span>
                    </button>
                  ))
                )}
            </div>
            </ScrollArea>
          </aside>

          {/* Center */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-7 py-2.5">
              <div className="flex min-w-0 flex-wrap items-center gap-0 text-[14px] leading-6">
                {breadcrumbTrail.map((crumb, idx) => (
                  <span key={idx} className="flex min-w-0 items-center">
                    {idx > 0 && (
                      <span className="px-2 text-[var(--ol-text-muted)]" aria-hidden>
                        <ChevronRight className="size-3 shrink-0 opacity-80" />
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
              </div>
              <div className="flex shrink-0 justify-center px-2">
                {totalPages > 1 ? (
                  <span className="inline-flex items-center gap-1">
                    <button type="button" className={navButtonClass} onClick={goToPreviousPage} disabled={isFirstPage} aria-label="Previous page">
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="min-w-[2.5rem] text-center text-[13px] tabular-nums text-[var(--ol-text)]/60">
                      {currentPageIndex + 1}/{totalPages}
                    </span>
                    <button type="button" className={navButtonClass} onClick={goToNextPage} disabled={isLastPage} aria-label="Next page">
                      <ChevronRight className="size-4" />
                    </button>
                  </span>
                ) : null}
              </div>
              {/* Empty third grid cell keeps the page navigation centered. */}
              <div aria-hidden />
            </header>

            <div
              role="note"
              aria-label="Preview only"
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b-2 border-[var(--ol-link-strong)] bg-[var(--ol-card-bg)] px-7 py-2.5"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--ol-accent-blue-bg)] px-2.5 py-1 text-[13px] font-medium text-[var(--ol-link)] ring-1 ring-[var(--ol-link-strong)]/40">
                  <Eye className="size-3.5 shrink-0" aria-hidden />
                  Preview only
                </span>
                <span className="min-w-0 text-[12px] leading-snug text-[var(--ol-text-muted)]">
                  {previewNote}
                </span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--ol-border)] bg-[var(--ol-input-bg)] px-2.5 py-1 text-[12px] font-medium text-[var(--ol-text-muted)]">
                <Lock className="size-3.5 shrink-0" aria-hidden />
                Read-only
              </span>
            </div>

            <div ref={centerScrollRef} className={cn("min-h-0 flex-1 overflow-y-auto px-7 pb-12 pt-1", torus.canvas)}>
              <div className="mx-auto w-full max-w-[1536px] font-[family-name:var(--font-family-open)]">
                {hasQuizContent ? (
                  <article className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h1 className="min-w-0 text-3xl font-semibold leading-tight text-[var(--ol-text)]">{breadcrumbTitle}</h1>
                      </div>
                    </div>

                    {shouldShowLearningObjectives ? (
                      <div
                        id="diff-lo-section"
                        className="rounded-md border border-[var(--ol-border)] bg-[var(--ol-panel)] px-6 py-4 shadow-[0_0_0_1px_var(--ol-border)]"
                      >
                        <h2 className="text-lg font-normal leading-[27px] text-[var(--ol-text)]">Learning Objectives</h2>
                        <div className="mt-1 rounded border border-[var(--ol-border)] bg-[var(--ol-card-bg)] p-1.5">
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
                                    "relative max-w-full rounded px-2 py-1 pl-2 pr-8 text-[16px] font-medium leading-4 text-[var(--ol-text)]",
                                    k === "added" && "ring-2 ring-[var(--ol-diff-added)] ring-offset-1 ring-offset-[var(--ol-card-bg)]",
                                    k === "edited" && "ring-2 ring-[var(--ol-diff-edited)]/55 ring-offset-1 ring-offset-[var(--ol-card-bg)]",
                                    k === "removed" && "ring-2 ring-[var(--ol-diff-removed)]/55 ring-offset-1 ring-offset-[var(--ol-card-bg)]",
                                    !k && "bg-[var(--ol-panel)]",
                                    k === "added" && "bg-[var(--ol-panel)]",
                                    k === "removed" && "bg-[var(--ol-diff-removed-bg)] line-through opacity-80",
                                    k === "edited" && "bg-[var(--ol-diff-edited-bg)]",
                                  )}
                                >
                                  <span className="block pr-6">{lo.text}</span>
                                  <span
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] leading-none text-[var(--ol-text)]/90"
                                    aria-hidden
                                  >
                                    ×
                                  </span>
                                  {k === "added" ? (
                                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--ol-action-added)]">
                                      Added
                                    </span>
                                  ) : k === "edited" ? (
                                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--ol-action-edited)]">
                                      Edited
                                    </span>
                                  ) : k === "removed" ? (
                                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--ol-action-removed)]">
                                      Removed
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {isLecturePreview ? (
                      viewMode === "full" ? (
                        <div className="mb-6 rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                          {selectedPage.previewVariant === "lecture-text" && textKind ? (
                            <DiffCurriculumFullPageLayout
                              pageTitle={breadcrumbTitle}
                              hideTitle
                              introductionSlot={renderCurriculumInlineTextIntro("full")}
                            />
                          ) : selectedPage.previewVariant === "lecture-image" && selectedPage.heroImageAfterSrc ? (
                            <DiffCurriculumFullPageLayout
                              pageTitle={breadcrumbTitle}
                              hideTitle
                              introductionSlot={defaultCurriculumIntro}
                              mediaSlot={
                                <div className="w-full max-w-[800px] space-y-2">
                                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--ol-text-muted)]">
                                    Hero image
                                  </p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border border-[var(--ol-border)] bg-[var(--ol-card-bg)]/80 p-3">
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ol-text-muted)]">Previous</p>
                                      <p className="mt-1 text-xs text-[var(--ol-text-muted)]">No hero (placeholder)</p>
                                      <div className="mt-3 h-48 rounded-md bg-[var(--ol-page-bg)] ring-1 ring-[var(--ol-border)]" aria-hidden />
                                    </div>
                                    <div
                                      id="diff-hero-image"
                                      className="relative rounded-lg border-2 border-[var(--ol-diff-added)] bg-[var(--ol-diff-added)]/18 p-2 shadow-[0_0_0_1px_rgba(33,131,88,0.35)]"
                                    >
                                      <span className="absolute right-2 top-2 z-10 rounded bg-[var(--ol-diff-added)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                        New
                                      </span>
                                      <div className="mb-1.5 rounded bg-[var(--ol-diff-added)]/18 px-2 py-1 text-[10px] font-semibold text-[var(--ol-action-added)]">
                                        Added — Hero image
                                      </div>
                                      <img
                                        src={selectedPage.heroImageAfterSrc}
                                        alt="New course hero: garden in full bloom"
                                        className="max-h-[min(280px,40vh)] w-full rounded-md object-cover"
                                      />
                                    </div>
                                  </div>
                                  <p className="text-center text-base text-[var(--ol-text)]/40">Caption (optional)</p>
                                </div>
                              }
                            />
                          ) : (
                            <DiffCurriculumStaticContent pageTitle={breadcrumbTitle} hideTitle />
                          )}
                        </div>
                      ) : (
                        <>
                          {selectedPage.previewVariant === "lecture-text" && textKind && (filter === "all" || filter === textKind) ? (
                            renderLecturePageTextPanel("diff")
                          ) : selectedPage.previewVariant === "lecture-image" && selectedPage.heroImageAfterSrc && (filter === "all" || filter === "added") ? (
                            <div
                              id="diff-hero-image"
                              className="rounded-lg border-2 border-[var(--ol-diff-added)] bg-[var(--ol-input-bg)] p-3 shadow-[0_0_0_1px_rgba(74,124,47,0.35)]"
                            >
                              <div className="mb-2 rounded-md bg-[var(--ol-diff-added)]/18 px-3 py-2 text-[11px] font-semibold text-[var(--ol-action-added)]">
                                Added — Hero image
                              </div>
                              <img
                                src={selectedPage.heroImageAfterSrc}
                                alt="New course hero: garden in full bloom"
                                className="max-h-[340px] w-full rounded-md object-cover"
                              />
                            </div>
                          ) : (
                            <p className="py-12 text-center text-sm text-[var(--ol-text)]/40">No changes match this filter.</p>
                          )}
                        </>
                      )
                    ) : viewMode === "full" ? (
                      <>
                        <div className="mb-6 rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                          <DiffCurriculumStaticContent pageTitle={breadcrumbTitle} hideTitle />
                        </div>

                        <section className="rounded-lg p-1 outline outline-1 outline-offset-[-1px] outline-[var(--ol-border)]">
                          <LbdToolbarRow />
                          <div className="overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
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
                                      isChanged && "rounded-lg p-1 outline outline-2 outline-offset-[-1px] sm:p-1.5",
                                      isChanged && kindOutlineClass(qKind),
                                    )}
                                  >
                                    {isChanged ? (
                                      <div
                                        className={cn(
                                          "flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-[11px] font-semibold",
                                          qKind === "added" && "bg-[var(--ol-diff-added)]/18 text-[var(--ol-action-added)]",
                                          qKind === "edited" && "bg-[var(--ol-diff-edited-bg)] text-[var(--ol-action-edited)]",
                                          qKind === "removed" && "bg-[var(--ol-diff-removed-bg)] text-[var(--ol-action-removed)]",
                                        )}
                                      >
                                        <span className="min-w-0 flex-1 truncate">{barLabel}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDetailLectureTextOpen(false);
                                            setDetailQuestionIndex(qIdx);
                                          }}
                                          className={detailButtonClass(qKind)}
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
                            <div className="overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                              <LearnByDoingStrip />
                              <MultipleChoiceQuestionInner neu={neu} merged={merged} />
                            </div>
                          );

                          return (
                            <section
                              key={qIdx}
                              id={`diff-q-${qIdx}`}
                              className={cn(
                                "rounded-lg p-1 outline outline-2 outline-offset-[-2px]",
                                kindOutlineClass(qKind),
                              )}
                            >
                              <div
                                className={cn(
                                  "mb-2 flex flex-wrap items-center justify-between gap-2 rounded-t-md px-3 py-2 text-[11px] font-semibold",
                                  qKind === "added" && "bg-[var(--ol-diff-added)]/18 text-[var(--ol-action-added)]",
                                  qKind === "edited" && "bg-[var(--ol-diff-edited-bg)] text-[var(--ol-action-edited)]",
                                  qKind === "removed" && "bg-[var(--ol-diff-removed-bg)] text-[var(--ol-action-removed)]",
                                )}
                              >
                                <span className="min-w-0 flex-1 truncate">{barLabel}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                            setDetailLectureTextOpen(false);
                                            setDetailQuestionIndex(qIdx);
                                          }}
                                  className={detailButtonClass(qKind)}
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
                    <div className="flex flex-col gap-8 rounded-lg border border-[var(--ol-accent-blue-bg)] bg-[var(--ol-input-bg)] p-6 shadow-[0_0_0_1px_var(--ol-accent-blue-bg)]">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-normal leading-7 text-[var(--ol-text)]">Notes</h2>
                          <span className="rounded bg-[var(--ol-accent-blue-bg)] px-2 py-1 text-[14px] font-bold leading-[14px] text-[var(--ol-text)]">
                            Enabled
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className="rounded-sm border border-[#0062F2] bg-white px-3 py-2 text-[14px] text-[#0062F2]"
                          >
                            Archive
                          </button>
                          <button type="button" className="rounded-sm bg-[var(--ol-card-bg)] px-3 py-2 text-[14px] text-[var(--ol-link-strong)]">
                            Disable
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="flex cursor-default items-start gap-3 text-[16px] leading-6 text-[var(--ol-text)]">
                          <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center bg-[#0062F2]">
                            <span className="size-2 bg-white" />
                          </span>
                          Allow posts to be visible without approval
                        </label>
                        <label className="flex cursor-default items-start gap-3 text-[16px] leading-6 text-[var(--ol-text)]">
                          <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center bg-[#0062F2]">
                            <span className="size-2 bg-white" />
                          </span>
                          Allow anonymous posts
                        </label>
                      </div>
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex flex-wrap items-stretch justify-center gap-4 pt-2 sm:justify-between">
                        <div className="w-full max-w-[400px] flex-1 rounded-sm border border-[var(--ol-border)] bg-[var(--ol-card-bg)] p-4 shadow-[1px_1px_6px_-2px_rgba(0,0,0,0.25)]">
                          <button
                            type="button"
                            disabled={isFirstPage}
                            onClick={goToPreviousPage}
                            className="flex w-full items-center gap-4 text-left disabled:opacity-40"
                          >
                            <ChevronLeft className="size-6 shrink-0 text-[var(--ol-link-strong)]" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="text-right text-[12.8px] leading-[19.2px] text-[var(--ol-text-muted)]">Previous</div>
                              <div className="text-right text-base leading-6 text-[var(--ol-link-strong)]">
                                {pages[Math.max(0, currentPageIndex - 1)]?.title ?? "—"}
                              </div>
                            </div>
                          </button>
                        </div>
                        <div className="hidden w-40 shrink-0 sm:block" aria-hidden />
                        <div className="w-full max-w-[400px] flex-1 rounded-sm border border-[var(--ol-border)] bg-[var(--ol-card-bg)] p-4 shadow-[1px_1px_6px_-2px_rgba(0,0,0,0.25)]">
                          <button
                            type="button"
                            disabled={isLastPage}
                            onClick={goToNextPage}
                            className="flex w-full items-center gap-4 text-left disabled:opacity-40"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[12.8px] leading-[19.2px] text-[var(--ol-text-muted)]">Next</div>
                              <div className="text-base leading-6 text-[var(--ol-link-strong)]">
                                {pages[Math.min(totalPages - 1, currentPageIndex + 1)]?.title ?? "—"}
                              </div>
                            </div>
                            <ChevronRight className="size-6 shrink-0 text-[var(--ol-link-strong)]" aria-hidden />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <p className="text-[12.8px] leading-[19.2px] text-[var(--ol-link)]">Cookie Preferences</p>
                      </>
                    ) : null}
                  </article>
                ) : hasTextDiff ? (
                  !textKind || filter === "all" || filter === textKind ? (
                    <div className="overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-input-bg)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                      <DiffCurriculumFullPageLayout
                        pageTitle={breadcrumbTitle}
                        introductionSlot={textKind ? renderCurriculumInlineTextIntro(viewMode) : defaultCurriculumIntro}
                      />
                    </div>
                  ) : (
                    <p className="py-12 text-center text-sm text-[var(--ol-text)]/40">No changes match this filter.</p>
                  )
                ) : (
                  <p className="text-center text-sm text-[var(--ol-text)]/40">No content to compare for this page.</p>
                )}
              </div>
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Compare pages"
                className="flex items-center justify-center gap-4 border-t border-[var(--ol-border)] bg-[var(--ol-card-bg)] px-4 py-2.5 lg:hidden"
              >
                <button type="button" className={navButtonClass} onClick={goToPreviousPage} disabled={isFirstPage} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm tabular-nums text-[var(--ol-text)]/60">
                  {currentPageIndex + 1} / {totalPages}
                </span>
                <button type="button" className={navButtonClass} onClick={goToNextPage} disabled={isLastPage} aria-label="Next page">
                  <ChevronRight className="size-4" />
                </button>
            </nav>
            ) : null}
          </div>

          {/* Right */}
          <aside className="flex w-full shrink-0 flex-col border-t border-[var(--ol-border)] bg-[var(--ol-card-bg)] lg:w-[220px] lg:border-l lg:border-t-0">
            {showRightActions ? (
              <div className="space-y-2 border-b border-[var(--ol-border)] px-3.5 py-3.5">
                {onPublishChanges ? (
                  <Button type="button" className={cn("h-9 w-full rounded-md border-0 text-[13px] font-medium", torus.publish)} onClick={onPublishChanges}>
                    Publish changes
                  </Button>
                ) : null}
                {onDiscardAll ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-md border-[var(--ol-border)] bg-transparent text-[12px] text-[var(--ol-text-muted)] hover:bg-[var(--ol-text)]/[0.04]"
                    onClick={onDiscardAll}
                  >
                    Discard all
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="flex min-h-0 flex-1 flex-col px-3.5 py-3">
              <div className="mb-2.5 flex min-h-[28px] items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--ol-text-muted)]">Summary</p>
                <DialogClose
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--ol-text)]/85 transition-colors hover:bg-white/10 hover:text-[var(--ol-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ol-card-bg)]"
                  aria-label="Close"
                >
                  <X className="size-4" strokeWidth={2} />
                </DialogClose>
              </div>
              <div className="space-y-0 border-b border-white/[0.05] pb-1">
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="flex items-center gap-1.5 text-[var(--ol-text-muted)]">
                    <CirclePlus className={cn("size-3.5 shrink-0", torus.added)} aria-hidden />
                    Added
                  </span>
                  <span className={cn("font-medium tabular-nums", torus.added)}>{stats.added}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="flex items-center gap-1.5 text-[var(--ol-text-muted)]">
                    <Pencil className={cn("size-3.5 shrink-0", torus.edited)} aria-hidden />
                    Edited
                  </span>
                  <span className={cn("font-medium tabular-nums", torus.edited)}>{stats.edited}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="flex items-center gap-1.5 text-[var(--ol-text-muted)]">
                    <CircleMinus className={cn("size-3.5 shrink-0", torus.removed)} aria-hidden />
                    Removed
                  </span>
                  <span className={cn("font-medium tabular-nums", torus.removed)}>{stats.removed}</span>
                </div>
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--ol-border)] px-3.5 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--ol-text-muted)]">Filter by</p>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "added", "edited", "removed"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] transition-colors",
                      "border border-[var(--ol-border)] text-[var(--ol-text-muted)] hover:bg-[var(--ol-text)]/[0.05]",
                      f === filter &&
                        f === "all" &&
                        "border-[var(--ol-border)] bg-[var(--ol-nav-active)] font-medium text-[var(--ol-text)]",
                      f === filter &&
                        f === "added" &&
                        "border-[var(--ol-diff-added)]/65 bg-[var(--ol-diff-added)]/16 font-medium text-[var(--ol-action-added)]",
                      f === filter &&
                        f === "edited" &&
                        "border-[var(--ol-diff-edited)]/55 bg-[var(--ol-diff-edited)]/16 font-medium text-[var(--ol-action-edited)]",
                      f === filter &&
                        f === "removed" &&
                        "border-[var(--ol-diff-removed)]/55 bg-[var(--ol-diff-removed)]/16 font-medium text-[var(--ol-action-removed)]",
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
        {renderLectureTextDetailOverlay()}
      </DialogContent>
    </Dialog>
  );
}
