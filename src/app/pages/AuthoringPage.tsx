import { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageStatusToggle } from "../components/PageStatusToggle";
import { ChevronRight, Save, Eye } from "lucide-react";
import { toast } from "sonner";

export function AuthoringPage() {
  const [isReady, setIsReady] = useState(false);
  const [pageTitle, setPageTitle] = useState("Introduction");
  const [pageContent, setPageContent] = useState(
    "Welcome to the Course Introduction\n\nThis course covers the fundamentals of web development."
  );

  const handleSave = () => {
    toast.success("Page saved", {
      description: "Your changes have been saved as a draft",
    });
  };

  const handleToggleReady = (ready: boolean) => {
    setIsReady(ready);
    toast.success(ready ? "Page marked as Ready" : "Page marked as Draft", {
      description: ready
        ? "This page will be included in the next publish"
        : "This page is excluded from publishing",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>UX Publication Project</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Create</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Page Editor</h1>
            <p className="text-sm text-muted-foreground">Edit page content</p>
          </div>
          <div className="flex items-center gap-3">
            <PageStatusToggle
              isReady={isReady}
              onToggle={handleToggleReady}
              pageName={pageTitle}
            />
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-5xl">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="space-y-2">
            <Label htmlFor="page-title" className="text-foreground">
              Page Title
            </Label>
            <Input
              id="page-title"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Enter page title..."
              className="bg-input-background border-border"
            />
          </div>

          {/* Page Content */}
          <div className="space-y-2">
            <Label htmlFor="page-content" className="text-foreground">
              Page Content
            </Label>
            <Textarea
              id="page-content"
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
              placeholder="Enter page content..."
              className="min-h-[400px] font-mono text-sm bg-input-background border-border"
            />
          </div>

          {/* Status Information */}
          <div className="p-4 border border-border rounded-lg bg-primary/5">
            <h3 className="font-semibold text-sm mb-2 text-foreground">Publishing Status</h3>
            <p className="text-sm text-foreground">
              {isReady ? (
                <>
                  ✓ This page is <strong>Ready to Publish</strong>. It will be included in the
                  next site-wide publish operation.
                </>
              ) : (
                <>
                  ⓘ This page is in <strong>Draft</strong> mode. It will be excluded from
                  publishing until you mark it as Ready.
                </>
              )}
            </p>
          </div>

          {/* Help Card */}
          <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
            <h3 className="font-semibold text-foreground">About Page Status</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-chart-2">Ready:</strong>
                <span className="text-muted-foreground ml-1">
                  The page is complete and will be included in the next publish operation. All
                  learners will see these changes once published.
                </span>
              </div>
              <div>
                <strong className="text-muted-foreground">Draft:</strong>
                <span className="text-muted-foreground ml-1">
                  The page is still being worked on and will be excluded from publishing. Use this
                  status for unfinished content or work in progress.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
