import { Link, useLocation } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Send,
  GraduationCap,
  FileSearch,
  Lightbulb,
  BarChart3,
  LineChart,
  Info,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "./ui/utils";

const nav = "font-[family-name:var(--font-family-open)]";

/** Screenshot 2 — section labels (WORKSPACE, UX PUBLICATION PLAN) */
const sectionHeadingClass =
  "ml-5 block truncate text-[14px] font-bold uppercase leading-tight tracking-normal text-[#B8B4BF]";

/** Screenshot 3 — all other sidebar labels */
const navItemText = "text-[14px] font-normal leading-5 text-[#BAB8BF]";

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
  const curriculumActive = location.pathname === "/" || location.pathname === "/authoring";

  const row = cn(
    "flex w-full min-h-9 items-center gap-3 rounded-lg py-2 text-left transition-colors hover:bg-white/[0.06]",
    collapsed ? "justify-center px-0" : "px-3",
  );
  const sub = cn(
    "flex w-full rounded-lg py-2 text-left text-sm transition-colors hover:bg-white/[0.06]",
    collapsed ? "justify-center px-0" : "pl-4 pr-3",
  );

  const iconClass = (active?: boolean) =>
    cn("size-5 shrink-0", active ? "text-white" : "text-[#BAB8BF]");

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-black shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-[width] duration-200 ease-out",
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
            "z-10 flex size-7 items-center justify-center rounded-full bg-[rgba(161,161,170,0.2)] text-[#B8B4BF] hover:bg-[rgba(161,161,170,0.32)]",
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
              <div className="flex min-h-9 w-full items-center gap-3 rounded-lg bg-[#7E2899] px-3 py-3 shadow-none" aria-current="page">
                <BookOpen className="size-5 shrink-0 text-white" strokeWidth={1.67} />
                <span className="text-[14px] font-semibold leading-5 text-white">Course Author</span>
              </div>
              <Link to="/instructor" className={row} title="Instructor">
                <BarChart3 className={iconClass()} strokeWidth={1.67} />
                <span className={navItemText}>Instructor</span>
              </Link>
              <button type="button" className={cn(row, "mb-3")} title="Student">
                <GraduationCap className={iconClass()} strokeWidth={1.54} />
                <span className={navItemText}>Student</span>
              </button>
            </div>

            <div className="my-3 border-t border-[#0F0D0F]" role="separator" />

            <div className="mb-3 px-0 pr-1">
              <SidebarSectionHeading lines={["UX PUBLICATION", "PLAN"]} />
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
                    <ChevronDown className="size-4 shrink-0 text-[#BAB8BF]" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-[#BAB8BF]" />
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
                    <Link
                      to="/"
                      className={cn(
                        sub,
                        curriculumActive ? "bg-[#222126] font-semibold text-white" : navItemText,
                      )}
                    >
                      Curriculum
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
                  <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-[#3B76D3] bg-[#3B76D3] px-2 text-[12.8px] font-medium uppercase leading-5 text-white">
                    1
                  </span>
                  {publishExpanded ? (
                    <ChevronDown className="size-4 shrink-0 text-[#BAB8BF]" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-[#BAB8BF]" />
                  )}
                </button>
                {publishExpanded && (
                  <div className="mt-0.5 flex flex-col pl-1">
                    <button type="button" className={cn(sub, navItemText)}>
                      Review
                    </button>
                    <Link
                      to="/"
                      className={cn(sub, isActive("/") ? "bg-[#222126] font-semibold text-white" : navItemText)}
                    >
                      Publish
                    </Link>
                    <div className={cn(sub, "justify-between gap-2")}>
                      <span className={navItemText}>Templates</span>
                      <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-[#3B76D3] bg-[#3B76D3] px-2 text-[12px] font-medium uppercase leading-5 text-white">
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
                  className={cn("size-4 shrink-0 text-[#BAB8BF] transition-transform", improveExpanded && "rotate-90")}
                />
              </button>
            </div>
          </>
        ) : (
          /* Screenshot 4 — collapsed icon rail */
          <div className="flex flex-col items-center gap-1 px-0">
            <div
              className="flex size-10 items-center justify-center rounded-lg bg-[#7E2899] text-white"
              title="Course Author"
              aria-current="page"
            >
              <BookOpen className="size-5 shrink-0" strokeWidth={1.67} />
            </div>
            <Link
              to="/instructor"
              className="flex size-10 items-center justify-center rounded-lg text-[#BAB8BF] hover:bg-white/[0.06]"
              title="Instructor"
            >
              <BarChart3 className="size-5 shrink-0" strokeWidth={1.67} />
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg text-[#BAB8BF] hover:bg-white/[0.06]"
              title="Student"
            >
              <GraduationCap className="size-5 shrink-0" strokeWidth={1.54} />
            </button>

            <div className="my-2 h-px w-8 bg-[#2a2a2a]" aria-hidden />

            <Link
              to="/"
              className="flex size-10 items-center justify-center rounded-lg text-[#BAB8BF] hover:bg-white/[0.06]"
              title="Overview"
            >
              <FileSearch className="size-5 shrink-0" strokeWidth={2} />
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg bg-white/[0.06] text-[#BAB8BF] hover:bg-white/[0.1]"
              title="Create"
              onClick={() => setCollapsed(false)}
            >
              <Lightbulb className="size-5 shrink-0" strokeWidth={2} />
            </button>
            <Link
              to="/"
              className="relative flex size-10 items-center justify-center rounded-lg text-[#BAB8BF] hover:bg-white/[0.06]"
              title="Publish"
            >
              <Send className="size-5 shrink-0" strokeWidth={2} />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[#3B76D3]" aria-hidden />
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg text-[#BAB8BF] hover:bg-white/[0.06]"
              title="Improve"
            >
              <LineChart className="size-5 shrink-0" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "mt-auto flex flex-col border-t border-[#0F0D0F] py-3",
          collapsed ? "items-center gap-2 px-0" : "gap-4 px-2",
        )}
      >
        <button
          type="button"
          className={cn(
            "flex items-center rounded-lg text-[#BAB8BF] transition-colors hover:bg-white/[0.06] hover:text-[#d4d4d4]",
            collapsed ? "size-10 justify-center p-0" : "w-full gap-3 py-2 pl-3 pr-2 text-left text-[14px] font-normal",
          )}
          title="Support"
        >
          <Info className="size-5 shrink-0 text-[#BAB8BF]" strokeWidth={1.5} />
          {!collapsed ? <span className={navItemText}>Support</span> : null}
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center rounded-lg bg-[rgba(161,161,170,0.2)] text-[#BAB8BF] transition-colors hover:bg-[rgba(161,161,170,0.28)]",
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
