import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Eye, ChevronDown, ChevronUp, CirclePlus, Pencil, CircleMinus } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLink,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

import { DiffViewModal } from "./DiffViewModal";
import { AuthorHoverCard } from "./AuthorHoverCard";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { cn } from "./ui/utils";

interface Change {
  id: string;
  page: string;
  /** Change action — matches the diff legend (Added / Edited / Removed). */
  action: "Added" | "Edited" | "Removed";
  /** Torus content/activity type, e.g. "Multiple choice", "Text", "Image", "Resource". */
  contentType: string;
  description: string;
  author: {
    name: string;
    initials: string;
    avatar?: string;
    email: string;
    role: string;
  };
  timestamp: Date;
  status: "pending" | "published";
  /** Publish version that shipped this change. Set on published rows only. */
  version?: string;
}

const recentChanges: Change[] = [
  {
    id: "3a",
    page: "Quiz Section",
    action: "Added",
    contentType: "Multiple choice",
    description: "Added two answer choices and a new learning objective to the gardening types quiz",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 23, 18, 20),
    status: "pending",
  },
  {
    id: "3b",
    page: "Quiz Section",
    action: "Added",
    contentType: "Multiple choice",
    description: "Added a fourth answer choice to the soil texture quiz",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 23, 18, 18),
    status: "pending",
  },
  {
    id: "1",
    page: "Introduction",
    action: "Edited",
    contentType: "Text",
    description: "Updated course overview description with modern web development focus",
    author: {
      name: "Sarah Chen",
      initials: "SC",
      email: "schen@university.edu",
      role: "Content Designer",
    },
    timestamp: new Date(2026, 2, 23, 14, 30),
    status: "pending",
  },
  {
    id: "2",
    page: "Module 1: Getting Started",
    action: "Added",
    contentType: "Image",
    description: "Replaced hero image with updated branding",
    author: {
      name: "Michael Rodriguez",
      initials: "MR",
      email: "mrodriguez@university.edu",
      role: "Visual Designer",
    },
    timestamp: new Date(2026, 2, 23, 11, 15),
    status: "pending",
  },
  {
    id: "9",
    page: "Course Settings",
    action: "Edited",
    contentType: "Text",
    description: "Updated enrollment messaging for self-paced sections",
    author: {
      name: "Nam, Hanara",
      initials: "HN",
      email: "hnam@university.edu",
      role: "Course Author",
    },
    timestamp: new Date(2026, 2, 23, 16, 5),
    status: "pending",
  },
  {
    id: "10",
    page: "Module 4: Watering",
    action: "Added",
    contentType: "Multiple choice",
    description: "Added a new knowledge check on drip vs. overhead irrigation trade-offs",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 23, 15, 40),
    status: "pending",
  },
  {
    id: "11",
    page: "Glossary",
    action: "Edited",
    contentType: "Text",
    description: "Clarified the definitions for loam, tilth, and mulch",
    author: {
      name: "Sarah Chen",
      initials: "SC",
      email: "schen@university.edu",
      role: "Content Designer",
    },
    timestamp: new Date(2026, 2, 23, 13, 55),
    status: "pending",
  },
  {
    id: "12",
    page: "Module 2: Basics",
    action: "Removed",
    contentType: "Image",
    description: "Removed a duplicate diagram from the soil layers section",
    author: {
      name: "Michael Rodriguez",
      initials: "MR",
      email: "mrodriguez@university.edu",
      role: "Visual Designer",
    },
    timestamp: new Date(2026, 2, 23, 12, 10),
    status: "pending",
  },
  {
    id: "13",
    page: "Course Overview",
    action: "Added",
    contentType: "Page",
    description: "Added a short welcome page outlining the weekly schedule",
    author: {
      name: "Nam, Hanara",
      initials: "HN",
      email: "hnam@university.edu",
      role: "Course Author",
    },
    timestamp: new Date(2026, 2, 23, 10, 30),
    status: "pending",
  },
  {
    id: "4",
    page: "Resources",
    action: "Removed",
    contentType: "Resource",
    description: "Removed outdated PDF attachment from 2025",
    author: {
      name: "Sarah Chen",
      initials: "SC",
      email: "schen@university.edu",
      role: "Content Designer",
    },
    timestamp: new Date(2026, 2, 22, 9, 20),
    status: "published",
    version: "v0.3.5",
  },
  {
    id: "5",
    page: "Module 3: Advanced Topics",
    action: "Added",
    contentType: "Page",
    description: "Created new module covering advanced gardening techniques",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 21, 15, 10),
    status: "published",
    version: "v0.3.4",
  },
  {
    id: "6",
    page: "Module 2: Basics",
    action: "Edited",
    contentType: "Page",
    description: "Reorganized section structure and updated navigation",
    author: {
      name: "Michael Rodriguez",
      initials: "MR",
      email: "mrodriguez@university.edu",
      role: "Visual Designer",
    },
    timestamp: new Date(2026, 2, 21, 10, 30),
    status: "published",
    version: "v0.3.4",
  },
  {
    id: "7",
    page: "Assessment: Final Quiz",
    action: "Added",
    contentType: "Assessment",
    description: "Added comprehensive final assessment with 10 questions",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 20, 13, 45),
    status: "published",
    version: "v0.3.3",
  },
  {
    id: "8",
    page: "Course Syllabus",
    action: "Edited",
    contentType: "Text",
    description: "Minor grammar and spelling corrections",
    author: {
      name: "Sarah Chen",
      initials: "SC",
      email: "schen@university.edu",
      role: "Content Designer",
    },
    timestamp: new Date(2026, 2, 19, 9, 15),
    status: "published",
    version: "v0.3.2",
  },
];

export function getDiffText(changeId: string) {
  switch (changeId) {
    case "1":
      return {
        current: `Welcome to the Course Introduction

This course covers the fundamentals of web development.

You will learn:
- HTML basics
- CSS styling
- Responsive design

Prerequisites: None required`,
        new: `Welcome to the Course Introduction

This course covers the fundamentals of modern web development.

You will learn:
- HTML5 and semantic markup
- CSS styling
- Responsive design

Prerequisites: Basic computer skills`,
      };

    case "2":
      return {
        current: `Module 1: Getting Started

[Hero Image: legacy-brand-2024.jpg]
Dimensions: 1200x600px
Alt text: "Welcome to gardening basics"

Introduction paragraph about getting started with your first garden.`,
        new: `Module 1: Getting Started

[Hero Image: updated-brand-2026.jpg] (added new image)
Dimensions: 1920x1080px (updated dimensions)
Alt text: "Modern gardening for sustainable living" (updated alt text)

Introduction paragraph about getting started with your first garden.`,
      };

    case "4":
      return {
        current: `Resources Section

Downloadable Materials:
- Gardening_Guide_2025.pdf (removed - outdated)
- Planting_Calendar_2026.pdf
- Soil_Testing_Guide.pdf

Additional reading materials and references.`,
        new: `Resources Section

Downloadable Materials:
- Planting_Calendar_2026.pdf
- Soil_Testing_Guide.pdf

Additional reading materials and references.`,
      };

    case "6":
      return {
        current: `Module 2: Basics

Section 1: Introduction
Section 2: Tools and Equipment
Section 3: Soil Preparation
Section 4: Planting Techniques
Section 5: Summary`,
        new: `Module 2: Basics

Part A: Getting Started
  - Section 1: Introduction
  - Section 2: Tools and Equipment (updated structure)

Part B: Core Techniques (added new organization)
  - Section 3: Soil Preparation
  - Section 4: Planting Techniques

Part C: Review (added new section)
  - Summary and Key Takeaways`,
      };

    case "8":
      return {
        current: `Course Syllabus

This cours will teach you the fundamental's of gardening. Student's will learn about soil, plants, and maintanence.

Through out the semester, you will complete varios assignments and quizes.`,
        new: `Course Syllabus

This course will teach you the fundamentals of gardening. Students will learn about soil, plants, and maintenance. (updated grammar and spelling)

Throughout the semester, you will complete various assignments and quizzes. (updated grammar and spelling)`,
      };

    case "9":
      return {
        current: `Course Settings — Enrollment

Self-paced sections open automatically when the course starts.`,
        new: `Course Settings — Enrollment

Self-paced sections open automatically when the course starts, and learners receive a reminder email 7 days before access ends.`,
      };

    default:
      return {
        current: `Welcome to the Course Introduction

This course covers the fundamentals of web development.

You will learn:
- HTML basics
- CSS styling
- JavaScript programming
- Responsive design

Prerequisites: None required`,
        new: `Welcome to the Course Introduction

This course covers the fundamentals of modern web development.

You will learn:
- HTML5 and semantic markup
- CSS3 styling and animations (updated content)
- JavaScript ES6+ programming (added modern features)
- Responsive and mobile-first design

Prerequisites: Basic computer skills`,
      };
  }
}

export function getDiffChanges(changeId: string) {
  if (changeId === "4" || changeId === "6" || changeId === "8") {
    return undefined;
  }

  if (changeId === "1") {
    const t = getDiffText("1");
    return [
      {
        id: "intro-lecture",
        title: "Introduction",
        breadcrumb: ["UX Publication Course", "Introduction"],
        learningObjectives: [
          { text: "Summarize the course purpose and prerequisites for learners.", status: "unchanged" as const },
          { text: "Identify core topics covered in the opening module.", status: "edited" as const },
        ],
        currentQuestions: [],
        newQuestions: [],
        previewVariant: "lecture-text" as const,
        currentVersionText: t.current,
        newVersionText: t.new,
      },
    ];
  }

  if (changeId === "2") {
    return [
      {
        id: "module1-lecture",
        title: "Module 1: Getting Started",
        breadcrumb: ["UX Publication Course", "Module 1: Getting Started"],
        learningObjectives: [
          { text: "Orient learners to module goals and the course visual identity.", status: "unchanged" as const },
          { text: "Explain how hero imagery supports motivation on landing pages.", status: "added" as const },
        ],
        currentQuestions: [],
        newQuestions: [],
        previewVariant: "lecture-image" as const,
        heroImageBeforeSrc: null,
        heroImageAfterSrc: "/assets/garden-hero-added.png",
        currentVersionText: "",
        newVersionText: "",
      },
    ];
  }

  if (changeId === "9") {
    const t = getDiffText("9");
    return [
      {
        id: "settings-lecture",
        title: "Course Settings",
        breadcrumb: ["UX Publication Course", "Course Settings"],
        learningObjectives: [
          {
            text: "Configure enrollment timing and automated emails for self-paced sections.",
            status: "edited" as const,
          },
        ],
        currentQuestions: [],
        newQuestions: [],
        previewVariant: "lecture-text" as const,
        currentVersionText: t.current,
        newVersionText: t.new,
      },
    ];
  }

  if (changeId === "3a") {
    return [
      {
        id: "quiz-1",
        title: "Mini-quiz 1",
        breadcrumb: ["Unit 1: Gardening Types", "Quiz Section", "Mini-quiz 1"],
        learningObjectives: [
          { text: "Identify common types of gardening (e.g., container, raised bed, hydroponics)", status: "unchanged" as const },
          { text: "Compare the maintenance needs and replanting frequency of each type", status: "added" as const },
        ],
        currentQuestions: [
          {
            question: "Which gardening type is most suitable for apartment dwellers with no yard?",
            answers: [
              { text: "Raised bed gardening", status: "unchanged" as const },
              { text: "In-ground gardening", status: "unchanged" as const },
            ],
          },
        ],
        newQuestions: [
          {
            question: "Which gardening type is most suitable for apartment dwellers with no yard?",
            answers: [
              { text: "Raised bed gardening", status: "unchanged" as const },
              { text: "In-ground gardening", status: "unchanged" as const },
              { text: "Hydroponic gardening", status: "added" as const },
              { text: "Container gardening", status: "added" as const },
            ],
          },
        ],
      },
    ];
  }

  if (changeId === "3b") {
    return [
      {
        id: "quiz-2",
        title: "Multiple Choice",
        breadcrumb: ["Unit 1: Gardening Types", "Quiz Section", "Multiple Choice"],
        learningObjectives: [{ text: "Identify the three primary soil textures: sand, silt, and clay", status: "unchanged" as const }],
        currentQuestions: [
          {
            question: "Which soil type drains quickly but has poor nutrient retention?",
            answers: [
              { text: "Clay", status: "unchanged" as const },
              { text: "Loam", status: "unchanged" as const },
              { text: "Silt", status: "unchanged" as const },
            ],
          },
        ],
        newQuestions: [
          {
            question: "Which soil type drains quickly but has poor nutrient retention?",
            answers: [
              { text: "Clay", status: "unchanged" as const },
              { text: "Loam", status: "unchanged" as const },
              { text: "Silt", status: "unchanged" as const },
              { text: "Sand", status: "added" as const },
            ],
          },
        ],
      },
    ];
  }

  if (changeId === "5") {
    return [
      {
        id: "module-3",
        title: "Module 3: Advanced Topics",
        breadcrumb: ["Course Content", "Module 3: Advanced Topics"],
        learningObjectives: [
          { text: "Apply advanced composting techniques for optimal soil health", status: "added" as const },
          { text: "Design and implement integrated pest management strategies", status: "added" as const },
          { text: "Evaluate seasonal planting schedules for year-round harvests", status: "added" as const },
        ],
        currentQuestions: [],
        newQuestions: [
          {
            question: "What is the optimal carbon-to-nitrogen ratio for composting?",
            answers: [
              { text: "10:1", status: "added" as const },
              { text: "20:1", status: "added" as const },
              { text: "30:1", status: "added" as const },
              { text: "40:1", status: "added" as const },
            ],
          },
        ],
      },
    ];
  }

  if (changeId === "7") {
    return [
      {
        id: "final-quiz",
        title: "Final Assessment",
        breadcrumb: ["Assessments", "Final Quiz"],
        learningObjectives: [
          { text: "Demonstrate comprehensive understanding of all course concepts", status: "added" as const },
          { text: "Apply learned techniques to real-world gardening scenarios", status: "added" as const },
        ],
        currentQuestions: [],
        newQuestions: [
          {
            question: "Which combination of factors is most critical for successful container gardening?",
            answers: [
              { text: "Soil quality, drainage, and sunlight exposure", status: "added" as const },
              { text: "Container size and color", status: "added" as const },
              { text: "Brand of fertilizer used", status: "added" as const },
              { text: "Time of day for watering", status: "added" as const },
            ],
          },
          {
            question: "What is the primary benefit of companion planting?",
            answers: [
              { text: "Pest control and nutrient optimization", status: "added" as const },
              { text: "Aesthetic appeal only", status: "added" as const },
              { text: "Reduced watering needs", status: "added" as const },
              { text: "Faster growth rates", status: "added" as const },
            ],
          },
        ],
      },
    ];
  }

  return undefined;
}

type SortKey = "page" | "type" | "author" | "modified" | "version";
type SortDirection = "asc" | "desc";

/**
 * Sortable column header. Clicking toggles asc/desc; the caret turns accent blue
 * on the active column. Non-sortable columns (Description, Actions) render plain text.
 */
function SortableHeader({
  children,
  active,
  direction,
  onToggle,
}: {
  children: string;
  active: boolean;
  direction: SortDirection;
  onToggle: () => void;
}) {
  const stateLabel = active ? (direction === "asc" ? "ascending" : "descending") : "not sorted";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Sort by ${children.toLowerCase()}, currently ${stateLabel}`}
      className="ol-sort-chevron inline-flex items-end gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ol-link-strong)]"
    >
      {children}
      {active && direction === "asc" ? (
        <ChevronUp className="size-5 shrink-0 text-[var(--ol-link-strong)]" aria-hidden />
      ) : (
        <ChevronDown
          className={cn(
            "size-5 shrink-0",
            active ? "text-[var(--ol-link-strong)]" : "text-[var(--ol-table-header-text)]",
          )}
          aria-hidden
        />
      )}
    </button>
  );
}

/**
 * Action accent for the type tag — tint uses the diff tokens (--ol-diff-*) so it
 * follows the DS per mode (light #1a7f4b/#c0392b/#b45309, dark #218358/#ff4040/#ff9040).
 * Tag text stays neutral; color is carried by the icon + tint so the chip reads calm.
 */
function getActionAccentClasses(action: Change["action"]) {
  switch (action) {
    case "Added":
      return "bg-[var(--ol-diff-added)]/18 text-[var(--ol-text)]";
    case "Removed":
      return "bg-[var(--ol-diff-removed)]/15 text-[var(--ol-text)]";
    case "Edited":
    default:
      return "bg-[var(--ol-diff-edited)]/15 text-[var(--ol-text)]";
  }
}

/** Leading action icon + its color — matches the diff "View changes" legend (CirclePlus / Pencil / CircleMinus). */
const ACTION_ICON = { Added: CirclePlus, Edited: Pencil, Removed: CircleMinus } as const;

function getActionIconColor(action: Change["action"]) {
  switch (action) {
    case "Added":
      return "text-[var(--ol-action-added)]";
    case "Removed":
      return "text-[var(--ol-action-removed)]";
    case "Edited":
    default:
      return "text-[var(--ol-action-edited)]";
  }
}

function getStatusColor(status: Change["status"]) {
  switch (status) {
    case "pending":
      return "border border-[var(--ol-border)] bg-[var(--ol-input-bg)] text-[var(--ol-text)]";
    case "published":
      return "border border-[var(--ol-border)] bg-[var(--ol-accent-blue-bg)] text-[var(--ol-accent-blue-text)]";
    default:
      return "border border-[var(--ol-border)] bg-[var(--ol-chip-bg)] text-[var(--ol-text)]";
  }
}

/** Compact status pill — neutral chrome */
const typeBadgeClass =
  "inline-flex items-center rounded-md border border-[var(--ol-border)] py-0.5 pl-2 pr-2 text-[13px] font-medium capitalize leading-tight shadow-none transition-colors";

/** Type tag — "[icon] Action · Torus type"; action-tinted bg from getActionAccentClasses. No capitalize so "Multiple choice" keeps its casing. */
const typeTagClass =
  "inline-flex items-center rounded-md border border-[var(--ol-border)] py-0.5 pl-2 pr-2 text-[13px] font-medium leading-tight shadow-none transition-colors";

/** Torus DS dropdown list (fill-input #2b282e, border-input-focused, radius-075, 8px padding). */
const dsSelectContentClass = "rounded-md border-[var(--ol-border)] bg-[var(--ol-input-bg)] p-2";
/** DS list item — text-low #bab8bf default; highlighted → fill-input-focused + white. Check sits at the right. */
const dsSelectItemClass =
  "gap-2 rounded-md py-2 pl-2 pr-8 text-sm text-[var(--ol-text-muted)] data-[highlighted]:bg-[var(--ol-chip-bg)] data-[highlighted]:text-[var(--ol-text)]";

function ExpandableDescription({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const clampRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const clampEl = clampRef.current;
    const measureEl = measureRef.current;
    if (!clampEl || !measureEl) return;

    const checkTruncation = () => {
      // line-clamp hides overflow without increasing scrollHeight, so compare against
      // an unclamped measurement element with the same width instead.
      setIsTruncated(measureEl.offsetHeight > clampEl.offsetHeight + 1);
    };

    checkTruncation();
    const observer = new ResizeObserver(checkTruncation);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [description]);

  const clampedBody = (
    <p ref={clampRef} className="m-0 line-clamp-2 whitespace-normal">
      {description}
    </p>
  );

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <p
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 m-0 w-full whitespace-normal"
        aria-hidden
      >
        {description}
      </p>
      {isTruncated ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full min-w-0 cursor-pointer text-left underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ol-link-strong)]/40"
              aria-label="View full description"
              aria-expanded={open}
            >
              {clampedBody}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className="z-[100] max-w-sm border-[var(--ol-border)] bg-[var(--ol-input-bg)] p-3 text-sm leading-5 text-[var(--ol-text)] shadow-lg"
          >
            {description}
          </PopoverContent>
        </Popover>
      ) : (
        clampedBody
      )}
    </div>
  );
}

function ChangeTypeBadge({ change }: { change: Change }) {
  const accent = getActionAccentClasses(change.action);
  const Icon = ACTION_ICON[change.action];
  return (
    <span className={cn(typeTagClass, accent)}>
      <Icon className={cn("mr-1.5 size-3.5 shrink-0", getActionIconColor(change.action))} aria-hidden />
      <span className="font-semibold">{change.action}</span>
      <span className="px-1 opacity-50" aria-hidden>
        ·
      </span>
      <span>{change.contentType}</span>
    </span>
  );
}

export function getDefaultIncludedPendingChangeIds(): string[] {
  return recentChanges.filter((c) => c.status === "pending").map((c) => c.id);
}

export function getPendingChangeCount(): number {
  return recentChanges.filter((c) => c.status === "pending").length;
}

type PublishHistorySectionProps = {
  /** Shown next to the author when a pending row matches this name (e.g. logged-in user). */
  currentUserDisplayName?: string;
  /** Pending change ids to include in the next publish (subset allowed). */
  includedPendingChangeIds: string[];
  onIncludedPendingChangeIdsChange: (ids: string[]) => void;
  /**
   * Pending change ids that have been published this session. They move from the
   * Pending tab to Published (prototype only — resets on refresh since the mock data
   * lives in module scope).
   */
  publishedPendingChangeIds?: string[];
};

export function PublishHistorySection({
  currentUserDisplayName = "Nam, Hanara",
  includedPendingChangeIds,
  onIncludedPendingChangeIdsChange,
  publishedPendingChangeIds = [],
}: PublishHistorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPage, setFilterPage] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "modified",
    direction: "desc",
  });

  // Clicking the active column flips direction; a new column starts with its natural
  // order (newest first for dates, A→Z for everything else).
  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "modified" ? "desc" : "asc" },
    );

  // Jump back to the first page whenever the result set or order changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPage, filterType, filterStatus, sort]);

  // The Version column only exists on the Published tab; drop back to the default
  // order if the active sort column disappears when switching tabs.
  useEffect(() => {
    if (filterStatus === "pending") {
      setSort((prev) => (prev.key === "version" ? { key: "modified", direction: "desc" } : prev));
    }
  }, [filterStatus]);

  // Session-only view of the data: pending changes published this session are
  // promoted to "published" so the Pending tab can show its empty state. Resets
  // on refresh because the underlying mock data lives in module scope.
  const effectiveChanges = useMemo(() => {
    if (publishedPendingChangeIds.length === 0) return recentChanges;
    const publishedSet = new Set(publishedPendingChangeIds);
    return recentChanges.map((c) =>
      c.status === "pending" && publishedSet.has(c.id)
        ? { ...c, status: "published" as const, version: c.version ?? "v0.3.6" }
        : c,
    );
  }, [publishedPendingChangeIds]);

  const pendingIds = useMemo(
    () => effectiveChanges.filter((c) => c.status === "pending").map((c) => c.id),
    [effectiveChanges],
  );

  // Distinct authors per page, offered as the "To:" autocomplete in the draft-email
  // modal (so an editor can email anyone else who has touched that page).
  const authorsByPage = useMemo(() => {
    const map = new Map<string, { name: string; email: string }[]>();
    for (const change of effectiveChanges) {
      const list = map.get(change.page) ?? [];
      if (!list.some((a) => a.email === change.author.email)) {
        list.push({ name: change.author.name, email: change.author.email });
      }
      map.set(change.page, list);
    }
    return map;
  }, [effectiveChanges]);

  const includedSet = useMemo(() => new Set(includedPendingChangeIds), [includedPendingChangeIds]);
  const allPendingSelected = pendingIds.length > 0 && pendingIds.every((id) => includedSet.has(id));
  const somePendingSelected = pendingIds.some((id) => includedSet.has(id));

  const setIncluded = (ids: string[]) => {
    const allowed = new Set(pendingIds);
    const next = ids.filter((id) => allowed.has(id));
    onIncludedPendingChangeIdsChange(next);
  };

  const togglePendingRow = (changeId: string, checked: boolean) => {
    const next = new Set(includedSet);
    if (checked) next.add(changeId);
    else next.delete(changeId);
    setIncluded([...next]);
  };

  const toggleAllPending = () => {
    if (allPendingSelected) setIncluded([]);
    else setIncluded([...pendingIds]);
  };

  const filteredChanges = effectiveChanges.filter((change) => {
    const matchesSearch =
      change.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPage = filterPage === "all" || change.page === filterPage;
    const matchesType = filterType === "all" || change.contentType === filterType;
    const matchesStatus = change.status === filterStatus;

    return matchesSearch && matchesPage && matchesType && matchesStatus;
  });

  // Active column sort; ties fall back to most recent first so the order stays stable.
  const dir = sort.direction === "asc" ? 1 : -1;
  const byRecency = (a: Change, b: Change) => b.timestamp.getTime() - a.timestamp.getTime();
  const displayedChanges = [...filteredChanges].sort((a, b) => {
    let cmp = 0;
    switch (sort.key) {
      case "page":
        cmp = a.page.localeCompare(b.page, undefined, { sensitivity: "base" });
        break;
      case "type":
        cmp = `${a.action} ${a.contentType}`.localeCompare(`${b.action} ${b.contentType}`, undefined, {
          sensitivity: "base",
        });
        break;
      case "author":
        cmp = a.author.name.localeCompare(b.author.name, undefined, { sensitivity: "base" });
        break;
      case "version":
        cmp = (a.version ?? "").localeCompare(b.version ?? "", undefined, { numeric: true });
        break;
      case "modified":
        cmp = a.timestamp.getTime() - b.timestamp.getTime();
        break;
    }
    return dir * cmp || byRecency(a, b);
  });

  // Pagination — 7 rows per page; page 1 is the most recent. Anything past the
  // first 7 rolls onto the next page.
  const PAGE_SIZE = 7;
  const totalPages = Math.max(1, Math.ceil(displayedChanges.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageChanges = displayedChanges.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = displayedChanges.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, displayedChanges.length);

  // Page items with ellipsis (DS pattern): first + last always shown, current ± 1,
  // with "…" filling the gaps. Collapses to a plain list for small page counts.
  const pageItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: (number | "ellipsis")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) items.push("ellipsis");
    for (let p = start; p <= end; p++) items.push(p);
    if (end < totalPages - 1) items.push("ellipsis");
    items.push(totalPages);
    return items;
  }, [page, totalPages]);

  const handleViewDiff = (changeId: string) => {
    setSelectedDiff(changeId);
    setShowDiffModal(true);
  };

  const uniquePages = Array.from(new Set(effectiveChanges.map((c) => c.page)));
  const uniqueContentTypes = Array.from(new Set(effectiveChanges.map((c) => c.contentType)));
  // Version only matters once something is published; hide the column when viewing only pending rows.
  const showVersionColumn = filterStatus !== "pending";
  const showDescriptionColumn = filterStatus === "published";
  const showIncludeColumn = filterStatus === "pending";

  // Empty-state copy keyed to the active status tab. Read out for screen readers via role="status".
  const emptyState =
    filterStatus === "pending"
      ? {
          title: "No pending changes",
          body: "There are no changes waiting to be included in the next publish.",
        }
      : {
          title: "No published changes yet",
          body: "Published changes will appear here after this project is published.",
        };
  const emptyStateColSpan =
    6 +
    (showIncludeColumn ? 1 : 0) +
    (showDescriptionColumn ? 1 : 0) +
    (showVersionColumn ? 1 : 0);

  // Per-status totals for the tab counts (independent of the search/page/type filters).
  const statusCounts = {
    pending: effectiveChanges.filter((c) => c.status === "pending").length,
    published: effectiveChanges.filter((c) => c.status === "published").length,
  };
  const statusTabs = [
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "published", label: "Published", count: statusCounts.published },
  ] as const;

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-base font-normal text-[var(--ol-text)]">Publication Changes</h3>
          <p className="text-sm font-normal text-[var(--ol-text-muted)]">
            Review pending changes before publishing, or view previously published changes for reference.
          </p>
        </div>

        <div className="ol-publish-controls flex flex-wrap items-center gap-3">
          <div className="ol-search flex min-w-[200px] max-w-sm flex-1 items-center gap-3 px-2">
            <Search className="ol-search-icon size-5 shrink-0" aria-hidden />
            <input
              type="text"
              placeholder="Search by page, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm leading-4 text-[var(--ol-text)] outline-none placeholder:text-[var(--ol-text-muted)]"
            />
          </div>

          <Select value={filterPage} onValueChange={setFilterPage}>
            <SelectTrigger className="w-[160px] text-sm">
              <SelectValue placeholder="Filter by page" />
            </SelectTrigger>
            <SelectContent className={dsSelectContentClass}>
              <SelectItem className={dsSelectItemClass} value="all">
                All Pages
              </SelectItem>
              {uniquePages.map((page) => (
                <SelectItem className={dsSelectItemClass} key={page} value={page}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] text-sm">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className={dsSelectContentClass}>
              <SelectItem className={dsSelectItemClass} value="all">
                All Types
              </SelectItem>
              {uniqueContentTypes.map((ct) => (
                <SelectItem className={dsSelectItemClass} key={ct} value={ct}>
                  {ct}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="gap-0">
          <TabsList className="h-9 w-fit items-center gap-1 rounded-md border border-[var(--ol-border)] bg-[var(--ol-input-bg)] p-1">
            {statusTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex-none gap-2 rounded-sm border-0 px-3 py-0 text-sm font-medium text-[var(--ol-text-muted)] transition-colors",
                  "hover:text-[var(--ol-text)]",
                  "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm",
                  "dark:text-[var(--ol-text-muted)] dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none tabular-nums",
                    filterStatus === tab.value ? "bg-white/20 text-white" : "bg-[var(--ol-chip-bg)] text-[var(--ol-text-muted)]",
                  )}
                >
                  {tab.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="ol-publish-table-wrap">
          <Table className="ol-publish-table">
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                {showIncludeColumn ? (
                  <TableHead className="h-auto w-[52px] min-w-[52px] align-middle">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={
                          allPendingSelected ? true : somePendingSelected ? "indeterminate" : false
                        }
                        onCheckedChange={() => toggleAllPending()}
                        disabled={pendingIds.length === 0}
                        aria-label="Select or clear all pending changes for publish"
                        className="size-4 border-[var(--ol-border)] bg-[var(--ol-input-bg)] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
                      />
                    </div>
                  </TableHead>
                ) : null}
                <TableHead className="h-auto" aria-sort={sort.key === "page" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                  <SortableHeader active={sort.key === "page"} direction={sort.direction} onToggle={() => toggleSort("page")}>
                    Page
                  </SortableHeader>
                </TableHead>
                <TableHead className="h-auto" aria-sort={sort.key === "type" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                  <SortableHeader active={sort.key === "type"} direction={sort.direction} onToggle={() => toggleSort("type")}>
                    Type
                  </SortableHeader>
                </TableHead>
                {showDescriptionColumn ? (
                  <TableHead className="h-auto">Description</TableHead>
                ) : null}
                <TableHead className="h-auto" aria-sort={sort.key === "author" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                  <SortableHeader active={sort.key === "author"} direction={sort.direction} onToggle={() => toggleSort("author")}>
                    Author
                  </SortableHeader>
                </TableHead>
                <TableHead className="h-auto" aria-sort={sort.key === "modified" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                  <SortableHeader active={sort.key === "modified"} direction={sort.direction} onToggle={() => toggleSort("modified")}>
                    Modified
                  </SortableHeader>
                </TableHead>
                <TableHead className="h-auto">Status</TableHead>
                {showVersionColumn ? (
                  <TableHead className="h-auto" aria-sort={sort.key === "version" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                    <SortableHeader active={sort.key === "version"} direction={sort.direction} onToggle={() => toggleSort("version")}>
                      Version
                    </SortableHeader>
                  </TableHead>
                ) : null}
                <TableHead className="h-auto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageChanges.length === 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={emptyStateColSpan} className="px-6 py-14 text-center align-middle">
                    <div role="status" className="mx-auto flex max-w-md flex-col items-center gap-1.5">
                      <p className="text-base font-medium text-[var(--ol-text)]">{emptyState.title}</p>
                      <p className="text-sm font-normal leading-5 text-[var(--ol-text-muted)]">{emptyState.body}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageChanges.map((change) => (
                <TableRow key={change.id} className="border-0">
                  {showIncludeColumn ? (
                    <TableCell className="align-middle">
                      <div className="flex items-center justify-center">
                        {change.status === "pending" ? (
                          <Checkbox
                            checked={includedSet.has(change.id)}
                            onCheckedChange={(v) => togglePendingRow(change.id, v === true)}
                            aria-label={`Include pending change on ${change.page} in next publish`}
                            className="size-4 border-[var(--ol-border)] bg-[var(--ol-input-bg)] data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                          />
                        ) : (
                          <span className="text-[var(--ol-text-subtle)]" aria-hidden>
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ) : null}
                  <TableCell className="font-normal">{change.page}</TableCell>
                  <TableCell>
                    <ChangeTypeBadge change={change} />
                  </TableCell>
                  {showDescriptionColumn ? (
                    <TableCell className="max-w-md font-normal">
                      <ExpandableDescription description={change.description} />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <AuthorHoverCard
                        name={change.author.name}
                        initials={change.author.initials}
                        avatar={change.author.avatar}
                        email={change.author.email}
                        changeContext={{ page: change.page, description: change.description }}
                        pageAuthors={authorsByPage.get(change.page)}
                      />
                      {change.status === "pending" && change.author.name === currentUserDisplayName ? (
                        <span className="rounded-[4px] border border-[var(--ol-border)] px-1.5 py-0.5 text-[11px] font-medium leading-none text-[var(--ol-text-muted)]">
                          you
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-normal text-[var(--ol-text-muted)]">{format(change.timestamp, "MMM d, h:mm a")}</TableCell>
                  <TableCell>
                    <span
                      className={`${typeBadgeClass} ${getStatusColor(change.status)}`}
                    >
                      {change.status}
                    </span>
                  </TableCell>
                  {showVersionColumn ? (
                    <TableCell className="font-normal tabular-nums">
                      {change.version ? (
                        <span className="text-[var(--ol-text)]">{change.version}</span>
                      ) : (
                        <>
                          <span className="text-[var(--ol-text-subtle)]" aria-hidden>
                            —
                          </span>
                          <span className="sr-only">Not yet published</span>
                        </>
                      )}
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDiff(change.id)}
                      className="gap-1 text-sm font-normal text-[var(--ol-link)] hover:bg-black/[0.04] dark:hover:bg-white/5 hover:text-[var(--ol-link)]"
                    >
                      <Eye className="h-4 w-4" />
                      View changes
                    </Button>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {displayedChanges.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
            <span className="text-sm text-[var(--ol-text-muted)]">
              {rangeStart}–{rangeEnd} of {displayedChanges.length}
            </span>
            {totalPages > 1 ? (
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationFirst
                      href="#"
                      aria-disabled={page === 1}
                      className={cn(page === 1 && "pointer-events-none")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setCurrentPage(1);
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem className="mr-1">
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page === 1}
                      className={cn(page === 1 && "pointer-events-none")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {pageItems.map((item, idx) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === page}
                          aria-label={`Go to page ${item}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem className="ml-1">
                    <PaginationNext
                      href="#"
                      aria-disabled={page === totalPages}
                      className={cn(page === totalPages && "pointer-events-none")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      href="#"
                      aria-disabled={page === totalPages}
                      className={cn(page === totalPages && "pointer-events-none")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setCurrentPage(totalPages);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        ) : null}
      </div>

      {selectedDiff && (
        <DiffViewModal
          open={showDiffModal}
          onOpenChange={setShowDiffModal}
          currentVersion={getDiffText(selectedDiff).current}
          newVersion={getDiffText(selectedDiff).new}
          pageName={recentChanges.find((c) => c.id === selectedDiff)?.page || "Introduction"}
          changes={getDiffChanges(selectedDiff)}
        />
      )}
    </>
  );
}
