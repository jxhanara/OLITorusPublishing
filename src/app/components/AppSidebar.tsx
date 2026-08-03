import { Link, useLocation } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  Send,
  FileSearch,
  Lightbulb,
  LineChart,
  Info,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { WritingIcon, ChartBarIcon, SchoolIcon } from "./TorusIcons";
import { cn } from "./ui/utils";

const nav = "font-[family-name:var(--font-family-open)]";

/** Section labels (WORKSPACE, UX PUBLICATION PLAN) — Figma: Open Sans Bold 14/24, text-low, left-aligned near the item block (~10px from the rail edge). */
const sectionHeadingClass =
  "ml-1 block truncate text-[14px] font-bold uppercase leading-6 tracking-normal text-[var(--ol-text-muted)]";

/** Screenshot 3 — all other sidebar labels */
const navItemText = "text-[14px] font-normal leading-5 text-[var(--ol-text-muted)]";

function SidebarSectionHeading({ lines }: { lines: string[] }) {
  return (
    <div className={cn(sectionHeadingClass, "space-y-0")}>
      {lines.filter(Boolean).map((line, idx) => (
        <div key={idx} className="h-6 truncate leading-6">
          {line}
        </div>
      ))}
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [createExpanded, setCreateExpanded] = useState(true);
  const [publishExpanded, setPublishExpanded] = useState(true);
  const [improveExpanded, setImproveExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  // Curriculum owns /authoring only. The Publish page ("/") highlights the Publish
  // sub-item, not Curriculum (they used to both point at "/").
  const curriculumActive = location.pathname === "/authoring";
  // WORKSPACE persona highlighting follows the active route. Course Author owns the
  // authoring/publish pages; Instructor owns /instructor. (Student has no page yet.)
  const courseAuthorActive = location.pathname === "/" || location.pathname === "/authoring";
  const instructorActive = location.pathname === "/instructor";

  const row = cn(
    "flex w-full min-h-9 items-center gap-3 rounded-lg py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
    collapsed ? "justify-center px-0" : "px-3",
  );
  const sub = cn(
    "flex w-full rounded-lg py-2 text-left text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
    collapsed ? "justify-center px-0" : "pl-4 pr-3",
  );

  const iconClass = (active?: boolean) =>
    cn("size-5 shrink-0", active ? "text-[var(--ol-nav-purple-text)]" : "text-[var(--ol-text-muted)]");

  // WORKSPACE persona row — purple pill when active, hover otherwise.
  const personaRow = (active: boolean) =>
    cn(
      "flex min-h-9 w-full items-center gap-3 rounded-lg text-left transition-colors",
      collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
      active ? "bg-[var(--ol-nav-purple)]" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
    );

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-[var(--ol-nav-bg)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-[width] duration-200 ease-out",
        nav,
        collapsed ? "w-[56px]" : "w-[200px]",
      )}
      aria-label="Workspace"
    >
      {/* Screenshot 4 — expand/collapse at top of rail */}
      <div className={cn("flex shrink-0 pt-3", collapsed ? "justify-center px-0 pb-1" : "justify-end px-2 pb-1 pt-2")}>
        <button
          type="button"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "z-10 flex size-7 items-center justify-center rounded-full bg-[rgba(161,161,170,0.2)] text-[var(--ol-text-muted)] hover:bg-[rgba(161,161,170,0.32)]",
            collapsed && "size-8 rounded-full",
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
          ) : (
            <svg width="5" height="9" viewBox="0 0 5 9" fill="none" aria-hidden>
              <path
                d="M4 1L1 4.5L4 8"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto pb-4", collapsed ? "px-1 pt-1" : "px-2 pt-1")}>
        {!collapsed ? (
          <>
            <div className="mb-2 px-0 pr-1">
              <SidebarSectionHeading lines={["WORKSPACE"]} />
            </div>
            <div className="mb-1 flex flex-col gap-2 px-1">
              <Link
                to="/"
                className={personaRow(courseAuthorActive)}
                aria-current={courseAuthorActive ? "page" : undefined}
                title="Course Author"
              >
                <WritingIcon className={iconClass(courseAuthorActive)} />
                <span className={cn("leading-5", courseAuthorActive ? "text-[var(--ol-nav-purple-text)]" : "text-[var(--ol-text-muted)]")}>
                  Course Author
                </span>
              </Link>
              <Link
                to="/instructor"
                className={personaRow(instructorActive)}
                aria-current={instructorActive ? "page" : undefined}
                title="Instructor"
              >
                <ChartBarIcon className={iconClass(instructorActive)} />
                <span className={cn("leading-5", instructorActive ? "text-[var(--ol-nav-purple-text)]" : "text-[var(--ol-text-muted)]")}>
                  Instructor
                </span>
              </Link>
              <button type="button" className={cn(personaRow(false), "mb-3")} title="Student">
                <SchoolIcon className={iconClass()} />
                <span className={navItemText}>Student</span>
              </button>
            </div>

            <div className="my-3 border-t border-[var(--ol-nav-divider)]" role="separator" />

            <div className="mb-3 px-0 pr-1">
              <SidebarSectionHeading lines={["UX CERTIFICATE"]} />
            </div>
            <div className="mb-1 flex flex-col gap-0.5 px-1">
              <Link to="/" className={row} title="Overview">
                <FileSearch className={iconClass()} strokeWidth={2} />
                <span className={navItemText}>Overview</span>
              </Link>

              <div className="flex flex-col">
                <button type="button" onClick={() => setCreateExpanded(!createExpanded)} className={row} title="Create">
                  <Lightbulb className={iconClass()} strokeWidth={2} />
                  <span className={cn("flex-1", navItemText)}>Create</span>
                  {createExpanded ? (
                    <ChevronDown className="size-4 shrink-0 text-[var(--ol-text-muted)]" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-[var(--ol-text-muted)]" />
                  )}
                </button>
                {createExpanded && (
                  <div className="mt-0.5 flex flex-col pl-1">
                    <button type="button" className={cn(sub, navItemText)}>
                      Objectives
                    </button>
                    <button type="button" className={cn(sub, navItemText)}>
                      Activity Bank
                    </button>
                    <button type="button" className={cn(sub, navItemText)}>
                      Experiments
                    </button>
                    <button type="button" className={cn(sub, navItemText)}>
                      Bibliography
                    </button>
                    <Link to="/authoring" className={cn(sub, curriculumActive && "bg-[var(--ol-nav-active)]")}>
                      <span className={curriculumActive ? "text-[var(--ol-text)]" : navItemText}>Curriculum</span>
                    </Link>
                    <button type="button" className={cn(sub, navItemText)}>
                      All Pages
                    </button>
                    <button type="button" className={cn(sub, navItemText)}>
                      All Activities
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <button type="button" onClick={() => setPublishExpanded(!publishExpanded)} className={row} title="Publish">
                  <div className="relative shrink-0">
                    <Send className={iconClass()} strokeWidth={2} />
                  </div>
                  <span className={cn("flex-1", navItemText)}>Publish</span>
                  <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary px-2 text-[12.8px] font-medium uppercase leading-5 text-white">
                    1
                  </span>
                  {publishExpanded ? (
                    <ChevronDown className="size-4 shrink-0 text-[var(--ol-text-muted)]" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-[var(--ol-text-muted)]" />
                  )}
                </button>
                {publishExpanded && (
                  <div className="mt-0.5 flex flex-col pl-1">
                    <button type="button" className={cn(sub, navItemText)}>
                      Review
                    </button>
                    <Link to="/" className={cn(sub, isActive("/") && "bg-[var(--ol-nav-active)]")}>
                      <span className={isActive("/") ? "text-[var(--ol-text)]" : navItemText}>Publish</span>
                    </Link>
                    <div className={cn(sub, "justify-between gap-2")}>
                      <span className={navItemText}>Templates</span>
                      <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary px-2 text-[12px] font-medium uppercase leading-5 text-white">
                        1
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => setImproveExpanded(!improveExpanded)} className={row} title="Improve">
                <LineChart className={iconClass()} strokeWidth={2} />
                <span className={cn("flex-1", navItemText)}>Improve</span>
                <ChevronRight
                  className={cn("size-4 shrink-0 text-[var(--ol-text-muted)] transition-transform", improveExpanded && "rotate-90")}
                />
              </button>
            </div>
          </>
        ) : (
          /* Screenshot 4 — collapsed icon rail */
          <div className="flex flex-col items-center gap-1 px-0">
            <Link
              to="/"
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                courseAuthorActive ? "bg-[var(--ol-nav-purple)] text-[var(--ol-nav-purple-text)]" : "text-[var(--ol-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
              )}
              title="Course Author"
              aria-current={courseAuthorActive ? "page" : undefined}
            >
              <WritingIcon className="size-5 shrink-0" />
            </Link>
            <Link
              to="/instructor"
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                instructorActive ? "bg-[var(--ol-nav-purple)] text-[var(--ol-nav-purple-text)]" : "text-[var(--ol-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
              )}
              title="Instructor"
              aria-current={instructorActive ? "page" : undefined}
            >
              <ChartBarIcon className="size-5 shrink-0" />
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg text-[var(--ol-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              title="Student"
            >
              <SchoolIcon className="size-5 shrink-0" />
            </button>

            <div className="my-2 h-px w-8 bg-[var(--ol-border)]" aria-hidden />

            <Link
              to="/"
              className="flex size-10 items-center justify-center rounded-lg text-[var(--ol-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              title="Overview"
            >
              <FileSearch className="size-5 shrink-0" strokeWidth={2} />
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg bg-black/[0.04] text-[var(--ol-text-muted)] hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
              title="Create"
              onClick={() => setCollapsed(false)}
            >
              <Lightbulb className="size-5 shrink-0" strokeWidth={2} />
            </button>
            <Link
              to="/"
              className="relative flex size-10 items-center justify-center rounded-lg text-[var(--ol-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              title="Publish"
            >
              <Send className="size-5 shrink-0" strokeWidth={2} />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" aria-hidden />
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg text-[var(--ol-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              title="Improve"
            >
              <LineChart className="size-5 shrink-0" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "mt-auto flex flex-col border-t border-[var(--ol-nav-divider)] py-3",
          collapsed ? "items-center gap-2 px-0" : "gap-4 px-2",
        )}
      >
        <button
          type="button"
          className={cn(
            "flex items-center rounded-lg text-[var(--ol-text-muted)] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[var(--ol-text)]",
            collapsed ? "size-10 justify-center p-0" : "w-full gap-3 py-2 pl-3 pr-2 text-left text-[14px] font-normal",
          )}
          title="Support"
        >
          <Info className="size-5 shrink-0 text-[var(--ol-text-muted)]" strokeWidth={1.5} />
          {!collapsed ? <span className={navItemText}>Support</span> : null}
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center rounded-lg bg-[rgba(161,161,170,0.2)] text-[var(--ol-text-muted)] transition-colors hover:bg-[rgba(161,161,170,0.28)]",
            collapsed ? "size-10 justify-center p-0" : "gap-3 px-3 py-2 text-left text-[14px] font-normal",
          )}
          title="Exit Project"
        >
          <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
          {!collapsed ? <span className={navItemText}>Exit Project</span> : null}
        </button>
      </div>
    </aside>
  );
}
