import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Eye, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { DiffViewModal } from "./DiffViewModal";
import { AuthorHoverCard } from "./AuthorHoverCard";
import { format } from "date-fns";

interface Change {
  id: string;
  page: string;
  type: "Text" | "Image" | "Layout" | "Delete" | "New" | "Multiple";
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
}

const recentChanges: Change[] = [
  {
    id: "1",
    page: "Introduction",
    type: "Text",
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
    type: "Image",
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
    id: "3",
    page: "Quiz Section",
    type: "Multiple",
    description: "Added new answer choices and updated learning objectives across 2 quizzes",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 22, 16, 45),
    status: "published",
  },
  {
    id: "4",
    page: "Resources",
    type: "Delete",
    description: "Removed outdated PDF attachment from 2025",
    author: {
      name: "Sarah Chen",
      initials: "SC",
      email: "schen@university.edu",
      role: "Content Designer",
    },
    timestamp: new Date(2026, 2, 22, 9, 20),
    status: "published",
  },
  {
    id: "5",
    page: "Module 3: Advanced Topics",
    type: "New",
    description: "Created new module covering advanced gardening techniques",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 21, 15, 10),
    status: "published",
  },
  {
    id: "6",
    page: "Module 2: Basics",
    type: "Layout",
    description: "Reorganized section structure and updated navigation",
    author: {
      name: "Michael Rodriguez",
      initials: "MR",
      email: "mrodriguez@university.edu",
      role: "Visual Designer",
    },
    timestamp: new Date(2026, 2, 21, 10, 30),
    status: "published",
  },
  {
    id: "7",
    page: "Assessment: Final Quiz",
    type: "New",
    description: "Added comprehensive final assessment with 10 questions",
    author: {
      name: "Emma Wilson",
      initials: "EW",
      email: "ewilson@university.edu",
      role: "Instructional Designer",
    },
    timestamp: new Date(2026, 2, 20, 13, 45),
    status: "published",
  },
  {
    id: "8",
    page: "Course Syllabus",
    type: "Text",
    description: "Minor grammar and spelling corrections",
    author: {
      name: "Sarah Chen",
      initials: "SC",
      email: "schen@university.edu",
      role: "Content Designer",
    },
    timestamp: new Date(2026, 2, 19, 9, 15),
    status: "published",
  },
];

function getDiffChanges(changeId: string) {
  if (changeId === "1" || changeId === "2" || changeId === "4" || changeId === "6" || changeId === "8") {
    return undefined;
  }

  if (changeId === "3") {
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

function SortableHeader({ children }: { children: ReactNode }) {
  return (
    <span className="ol-sort-chevron inline-flex items-end gap-1">
      {children}
      <ChevronDown className="size-5 shrink-0 text-white" aria-hidden />
    </span>
  );
}

function getTypeColor(type: Change["type"]) {
  switch (type) {
    case "Text":
      return "bg-[#275CAF]";
    case "Image":
      return "bg-[#6d28d9]";
    case "Layout":
      return "bg-[#047857]";
    case "Delete":
      return "bg-[#b91c1c]";
    case "New":
      return "bg-[#1d4ed8]";
    case "Multiple":
      return "bg-[#a21caf]";
    default:
      return "bg-[#525252]";
  }
}

function getStatusColor(status: Change["status"]) {
  switch (status) {
    case "pending":
      return "bg-[#F1C40F]";
    case "published":
      return "bg-[#275CAF]";
    default:
      return "bg-[#525252]";
  }
}

function getDiffText(changeId: string) {
  switch (changeId) {
    case "1":
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

export function PublishHistorySection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPage, setFilterPage] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);

  const filteredChanges = recentChanges.filter((change) => {
    const matchesSearch =
      change.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPage = filterPage === "all" || change.page === filterPage;
    const matchesType = filterType === "all" || change.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === "all" || change.status === filterStatus;

    return matchesSearch && matchesPage && matchesType && matchesStatus;
  });

  const handleViewDiff = (changeId: string) => {
    setSelectedDiff(changeId);
    setShowDiffModal(true);
  };

  const uniquePages = Array.from(new Set(recentChanges.map((c) => c.page)));

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-base font-normal text-white">Pending &amp; Recent Changes</h3>
          <p className="text-sm font-normal text-[#BAB8BF]">Review all modifications before publishing</p>
        </div>

        <div className="ol-publish-controls flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Search by page, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ol-publish-input border-[#525252] bg-[#262626] pl-10 text-[#D4D4D4] placeholder:text-[#737373]"
            />
          </div>

          <Select value={filterPage} onValueChange={setFilterPage}>
            <SelectTrigger className="w-[160px] border-[#525252] bg-[#262626] text-[#D4D4D4]">
              <SelectValue placeholder="Filter by page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              {uniquePages.map((page) => (
                <SelectItem key={page} value={page}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] border-[#525252] bg-[#262626] text-[#D4D4D4]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="layout">Layout</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="multiple">Multiple</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] border-[#525252] bg-[#262626] text-[#D4D4D4]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Recent Changes</h3>
          <span className="text-sm text-[#BAB8BF]">
            {filteredChanges.length} {filteredChanges.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="ol-publish-table-wrap">
          <Table className="ol-publish-table">
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="h-auto">
                  <SortableHeader>Page</SortableHeader>
                </TableHead>
                <TableHead className="h-auto">
                  <SortableHeader>Type</SortableHeader>
                </TableHead>
                <TableHead className="h-auto">
                  <SortableHeader>Description</SortableHeader>
                </TableHead>
                <TableHead className="h-auto">
                  <SortableHeader>Author</SortableHeader>
                </TableHead>
                <TableHead className="h-auto">
                  <SortableHeader>Modified</SortableHeader>
                </TableHead>
                <TableHead className="h-auto">
                  <SortableHeader>Status</SortableHeader>
                </TableHead>
                <TableHead className="h-auto">
                  <SortableHeader>Actions</SortableHeader>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChanges.map((change) => (
                <TableRow key={change.id} className="border-0">
                  <TableCell className="font-normal">{change.page}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded px-2 py-1 text-sm font-bold capitalize leading-none text-white ${getTypeColor(change.type)}`}
                    >
                      {change.type}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal font-normal">{change.description}</TableCell>
                  <TableCell>
                    <AuthorHoverCard
                      name={change.author.name}
                      initials={change.author.initials}
                      avatar={change.author.avatar}
                      email={change.author.email}
                      role={change.author.role}
                      triggerClassName="[&_span]:text-[#D4D4D4]"
                    />
                  </TableCell>
                  <TableCell className="font-normal text-[#D4D4D4]">{format(change.timestamp, "MMM d, h:mm a")}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded px-2 py-1 text-sm font-bold capitalize leading-none text-white ${getStatusColor(change.status)}`}
                    >
                      {change.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDiff(change.id)}
                      className="gap-1 text-sm font-normal text-[#99CCFF] hover:bg-white/5 hover:text-[#b3d9ff]"
                    >
                      <Eye className="h-4 w-4" />
                      View Diff
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
