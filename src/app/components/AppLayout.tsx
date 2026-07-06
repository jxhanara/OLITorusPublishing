import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--ol-page-bg)]">
      <AppTopBar />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="relative min-w-0 flex-1 overflow-y-auto bg-[var(--ol-page-bg)]">{children}</main>
      </div>
    </div>
  );
}
