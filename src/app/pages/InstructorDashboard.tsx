import { useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { UpdateNotificationBanner } from "../components/UpdateNotificationBanner";
import { DiffViewModal } from "../components/DiffViewModal";
import { getDiffText, getDiffChanges } from "../components/PublishHistorySection";
import { ChevronRight, BookOpen, Users, TrendingUp, Clock } from "lucide-react";

/**
 * Instructor-facing updates. Each maps to a published change id so "View Changes"
 * can open the same full authoring diff (learning objectives, question-level edits,
 * before/after text) that the Course Author sees on the Publish page.
 */
const instructorUpdates = [
  {
    changeId: "1",
    page: "Introduction",
    description: "Updated course overview description with modern web development focus",
    author: "Sarah Chen",
    modified: "March 23, 2:30 PM",
    published: true,
  },
  {
    changeId: "2",
    page: "Module 1",
    description: "Replaced hero image with updated branding assets",
    author: "Michael Rodriguez",
    modified: "March 23, 11:15 AM",
    published: true,
  },
  {
    changeId: "3a",
    page: "Quiz Section",
    description: "Reorganized question order for better learning progression",
    author: "Emma Wilson",
    modified: "March 22, 4:45 PM",
    published: true,
    older: true,
  },
] as const;

export function InstructorDashboard() {
  const [showNotification, setShowNotification] = useState(true);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<{ changeId: string; page: string } | null>(null);

  const handleViewChanges = () => {
    setShowNotification(false);
    window.scrollTo({ top: document.getElementById("recent-updates")?.offsetTop, behavior: "smooth" });
  };

  const handleViewDiff = (changeId: string, page: string) => {
    setSelectedDiff({ changeId, page });
    setShowDiffModal(true);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Update Notification */}
      {showNotification && (
        <UpdateNotificationBanner
          message="New content updates are available for your course. 2 pages have been modified."
          onViewChanges={handleViewChanges}
          autoDismissDelay={15000}
        />
      )}

      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>UX Publication Project</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Instructor</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Instructor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Course overview and recent updates</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Course Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Total Students</span>
            </div>
            <div className="text-3xl font-semibold text-foreground">247</div>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Active Modules</span>
            </div>
            <div className="text-3xl font-semibold text-foreground">24</div>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Avg. Completion</span>
            </div>
            <div className="text-3xl font-semibold text-foreground">78%</div>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Last Updated</span>
            </div>
            <div className="text-lg font-semibold text-foreground">2 hours ago</div>
          </div>
        </div>

        {/* Recent Updates Section */}
        <div id="recent-updates" className="border border-border rounded-lg bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Recent Content Updates</h2>
                <p className="text-sm text-muted-foreground">
                  Review the latest changes to your course content
                </p>
              </div>
              <Badge className="bg-primary/20 text-primary">2 New Updates</Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {instructorUpdates.map((update) => (
              <div
                key={update.changeId}
                className={`p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors ${
                  update.older ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{update.page}</h3>
                      <Badge
                        className={update.older ? "bg-muted text-muted-foreground" : "bg-chart-2/20 text-chart-2"}
                      >
                        Published
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Modified by {update.author}</span>
                      <span>•</span>
                      <span>{update.modified}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDiff(update.changeId, update.page)}
                  >
                    View Changes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Sections */}
        <div className="border border-border rounded-lg bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold text-foreground">Course Sections</h2>
            <p className="text-sm text-muted-foreground">All active learning modules in your course</p>
          </div>
          <div className="p-6 space-y-2">
            {[
              { name: "Introduction", students: 247, completion: 95 },
              { name: "Module 1: HTML Basics", students: 235, completion: 82 },
              { name: "Module 2: CSS Styling", students: 198, completion: 71 },
              { name: "Module 3: JavaScript", students: 167, completion: 64 },
              { name: "Final Project", students: 89, completion: 36 },
            ].map((section, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{section.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">{section.students} students</span>
                  <span className="text-muted-foreground">{section.completion}% completion</span>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${section.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDiff && (
        <DiffViewModal
          open={showDiffModal}
          onOpenChange={setShowDiffModal}
          pageName={selectedDiff.page}
          previewNote="You're seeing published changes. Content can't be edited from this view."
          currentVersion={getDiffText(selectedDiff.changeId).current}
          newVersion={getDiffText(selectedDiff.changeId).new}
          changes={getDiffChanges(selectedDiff.changeId)}
        />
      )}
    </div>
  );
}
