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

const navFont = "font-[family-name:var(--font-family-open)] tracking-[-0.35px]";
const sectionLabel = `${navFont} px-3 text-xs font-bold uppercase leading-6 text-[#B8B4BF]`;
const itemText = `${navFont} text-sm font-normal leading-5 text-white`;
const itemTextActive = `${navFont} text-sm font-semibold leading-5 text-white`;
const chevronClass = "size-4 shrink-0 text-[#BAB8BF]";

export function AppSidebar() {
  const location = useLocation();
  const [createExpanded, setCreateExpanded] = useState(false);
  const [publishExpanded, setPublishExpanded] = useState(true);
  const [improveExpanded, setImproveExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const rowBase =
    "flex w-full min-h-9 items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.06]";
  const subRowBase =
    "flex w-full items-center rounded-lg py-2 pl-4 pr-3 text-left text-sm transition-colors hover:bg-white/[0.06]";

  return (
    <div className="relative flex h-screen w-[200px] shrink-0 flex-col bg-black shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="relative flex h-14 shrink-0 items-center border-b border-[#0F0D0F] px-2 pt-2 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#39E581] to-[#0062F2]"
            aria-hidden
          />
          <div className={`${navFont} flex min-w-0 flex-wrap items-baseline gap-0.5 leading-5 text-white`}>
            <span className="text-[15px] font-bold">OLI</span>
            <span className="text-[15px] font-normal">Torus</span>
            <sup className="ml-0.5 align-super text-[10px] font-normal leading-none text-[#B8B4BF]">[TEST]</sup>
          </div>
        </div>
        <button
          type="button"
          aria-label="Collapse navigation"
          className="absolute left-[176px] top-14 z-10 flex size-6 items-center justify-center rounded-l-full bg-[rgba(161,161,170,0.2)] text-[#B8B4BF] hover:bg-[rgba(161,161,170,0.32)]"
        >
          <svg width="5" height="9" viewBox="0 0 5 9" fill="none" aria-hidden>
            <path
              d="M4 1L1 4.5L4 8"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-4 pt-4">
        <p className={`mb-2 ${sectionLabel}`}>Workspace</p>
        <div className="mb-1 flex flex-col gap-2 px-1">
          <div
            className={`${rowBase} bg-[#7B2CBF]`}
            aria-current="page"
          >
            <BookOpen className="size-5 shrink-0 text-white" strokeWidth={1.67} />
            <span className={itemTextActive}>Course Author</span>
          </div>
          <Link to="/instructor" className={rowBase}>
            <BarChart3 className="size-5 shrink-0 text-white" strokeWidth={1.67} />
            <span className={itemText}>Instructor</span>
          </Link>
          <button type="button" className={`${rowBase} mb-6`}>
            <GraduationCap className="size-5 shrink-0 text-white" strokeWidth={1.54} />
            <span className={itemText}>Student</span>
          </button>
        </div>

        <p className={`mb-2 ${sectionLabel}`}>UX Publication Project</p>
        <div className="flex flex-col gap-0.5 px-1">
          <Link to="/" className={rowBase}>
            <FileSearch className="size-5 shrink-0 text-white" strokeWidth={2} />
            <span className={itemText}>Overview</span>
          </Link>

          <button
            type="button"
            onClick={() => setCreateExpanded(!createExpanded)}
            className={rowBase}
          >
            <Lightbulb className="size-5 shrink-0 text-white" strokeWidth={2} />
            <span className={`${itemText} flex-1`}>Create</span>
            <ChevronRight className={`${chevronClass} transition-transform ${createExpanded ? "rotate-90" : ""}`} />
          </button>

          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setPublishExpanded(!publishExpanded)}
              className={rowBase}
            >
              <Send className="size-5 shrink-0 text-white" strokeWidth={2} />
              <span className={`${itemText} flex-1`}>Publish</span>
              {publishExpanded ? (
                <ChevronDown className={chevronClass} />
              ) : (
                <ChevronRight className={chevronClass} />
              )}
            </button>
            {publishExpanded && (
              <div className="mt-0.5 flex flex-col border-0 pl-1">
                <button type="button" className={`${subRowBase} text-[#BAB8BF] ${navFont} font-normal`}>
                  Review
                </button>
                <Link
                  to="/"
                  className={`${subRowBase} ${navFont} ${
                    isActive("/")
                      ? "bg-[#222126] font-semibold text-white"
                      : "font-normal text-[#BAB8BF]"
                  }`}
                >
                  Publish
                </Link>
                <div className={`${subRowBase} justify-between gap-2`}>
                  <span className={`${navFont} font-normal text-[#BAB8BF]`}>Templates</span>
                  <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full border border-[#3B76D3] bg-[#3B76D3] px-2 text-xs font-normal uppercase leading-5 text-white">
                    1
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setImproveExpanded(!improveExpanded)}
            className={rowBase}
          >
            <LineChart className="size-5 shrink-0 text-white" strokeWidth={2} />
            <span className={`${itemText} flex-1`}>Improve</span>
            <ChevronRight className={`${chevronClass} transition-transform ${improveExpanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-4 border-t border-[#0F0D0F] px-2 py-3">
        <button
          type="button"
          className={`flex w-full items-center gap-3 rounded-lg py-2 pl-3 pr-2 text-left ${navFont} text-sm font-normal text-[#A3A3A3] transition-colors hover:bg-white/[0.06] hover:text-[#d4d4d4]`}
        >
          <Info className="size-5 shrink-0 text-white" strokeWidth={1.5} />
          Support
        </button>
        <button
          type="button"
          className={`flex w-full items-center gap-3 rounded-lg bg-[rgba(161,161,170,0.2)] px-3 py-2 text-left ${navFont} text-sm font-normal text-white transition-colors hover:bg-[rgba(161,161,170,0.3)]`}
        >
          <LogOut className="size-4 shrink-0 text-[#B8B4BF]" strokeWidth={1.75} />
          Exit Project
        </button>
      </div>
    </div>
  );
}
