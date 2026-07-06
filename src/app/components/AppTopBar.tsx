import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

/**
 * Matches curriculum shell: 56px bar, project title (Roboto per Figma — we use Open
 * Sans weight 500). Theme-aware: dark shell is black, light shell is white, and the
 * logo swaps to the light (dark-text) wordmark in light mode.
 */
export function AppTopBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const logoSrc = `${import.meta.env.BASE_URL}assets/oli-torus-logo${isDark ? "" : "-light"}.png`;

  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-b border-[var(--ol-nav-divider)] bg-[var(--ol-nav-bg)] px-4">
      <div className="flex w-[192px] shrink-0 items-center">
        <img src={logoSrc} alt="OLI Torus" className="h-[27px] w-auto shrink-0" />
      </div>
      <div className="min-w-0 flex-1 font-[family-name:var(--font-family-open)] text-2xl font-medium leading-8 text-[var(--ol-text-muted)]">
        UX Publication Project
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--ol-text-muted)] transition-colors hover:bg-[var(--ol-nav-active)] hover:text-[var(--ol-text)]"
      >
        {isDark ? <Sun className="size-5" strokeWidth={1.75} /> : <Moon className="size-5" strokeWidth={1.75} />}
      </button>
      <div
        className="size-8 shrink-0 rounded-full border-2 border-[var(--ol-border)] bg-[var(--ol-input-focus)]"
        aria-label="Account"
        role="img"
      />
    </header>
  );
}
