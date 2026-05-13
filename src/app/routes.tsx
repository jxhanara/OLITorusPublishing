import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { PublishDashboard } from "./pages/PublishDashboard";
import { AuthoringPage } from "./pages/AuthoringPage";
import { InstructorDashboard } from "./pages/InstructorDashboard";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

const viteBase = import.meta.env.BASE_URL;
const routerBasename =
  viteBase !== "/" && viteBase !== ""
    ? viteBase.replace(/\/$/, "")
    : undefined;

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <LayoutWrapper>
          <PublishDashboard />
        </LayoutWrapper>
      ),
    },
    {
      path: "/authoring",
      element: (
        <LayoutWrapper>
          <AuthoringPage />
        </LayoutWrapper>
      ),
    },
    {
      path: "/instructor",
      element: (
        <LayoutWrapper>
          <InstructorDashboard />
        </LayoutWrapper>
      ),
    },
  ],
  routerBasename ? { basename: routerBasename } : {},
);
