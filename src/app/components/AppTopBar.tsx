/**
 * Matches curriculum shell: 56px bar, black, project title (Roboto per Figma — we use Open Sans weight 500).
 */
export function AppTopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-b border-[#0F0D0F] bg-black px-4">
      <div className="flex w-[192px] shrink-0 items-center gap-2">
        <div
          className="size-9 shrink-0 rounded-md bg-gradient-to-br from-[#39E581] to-[#0062F2]"
          aria-hidden
        />
        <div className="font-[family-name:var(--font-family-open)] leading-tight text-white">
          <span className="text-[15px] font-bold">OLI</span>
          <span className="text-[15px] font-normal"> Torus</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 font-[family-name:var(--font-family-open)] text-2xl font-medium leading-8 text-[#BAB8BF]">
        UX Publication Project
      </div>
      <div
        className="size-8 shrink-0 rounded-full border-2 border-[#404040] bg-[#262626]"
        aria-label="Account"
        role="img"
      />
    </header>
  );
}
