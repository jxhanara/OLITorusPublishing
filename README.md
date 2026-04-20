# Publishing & Content Management System

A comprehensive publishing dashboard for managing course content with advanced features for content versioning, change tracking, and collaborative workflows.

## Features

### Priority 0 (P0) Features

1. **Auto-Push Safeguard** - High-friction confirmation modal when disabling auto-push
   - Requires typing "DISABLE AUTO-PUSH" to confirm
   - Shows warning about manual updates for all sections
   - Prevents accidental workflow disruptions

2. **Publishing Progress Indicators** - Real-time feedback during publishing
   - Visual progress bar with percentage
   - Status messages (publishing, success, error)
   - Cancelable operations
   - Toast notifications for completion

3. **Change Attribution** - "Modified By" column in changes table
   - User avatars with initials fallback
   - Full name display
   - Timestamp tracking
   - Filterable and searchable

4. **Terminology Standardization** - Consistent naming across the platform
   - "Publish" for deployment actions
   - "Page" for content units
   - "Section" for course modules
   - "Author" for content creators

### Priority 1 (P1) Features

1. **Visual Diff / Change Summary** - Side-by-side comparison modal
   - Split-pane view (Current vs New)
   - Color-coded changes (red for deletions, green for additions)
   - Line-by-line comparison
   - Modal accessible from changes table

2. **Publishing History Log** - Complete audit trail
   - Timeline view with all publish events
   - Author attribution with avatars
   - Comments/notes for each publish
   - Success/failure status tracking
   - Searchable by author, action, or comment

3. **"Ready to Publish" Toggle** - Page-level status control
   - Draft/Ready badge in authoring interface
   - Tooltip explaining implications
   - Excludes draft pages from publishing
   - Visual status indicators

### Priority 2 (P2) Features

1. **Update Notification Banner** - Instructor-facing alerts
   - Auto-dismissing toast notification
   - "View Changes" call-to-action
   - Smooth animations
   - Positioned in top-right corner

## Application Structure

### Pages

- **Publishing Dashboard** (`/`) - Publishing controls, publishing history (pending and recent changes with search and filters), and active sections
- **Authoring Page** (`/authoring`) - Content editor with ready/draft toggle
- **Instructor Dashboard** (`/instructor`) - Learner-facing view with update notifications

### Components

- `AutoPushConfirmationModal` - P0 safety confirmation
- `PublishProgressBar` - P0 publishing feedback
- `ChangesDataTable` - P0 changes tracking with attribution
- `DiffViewModal` - P1 visual comparison
- `PageStatusToggle` - P1 ready/draft control
- `UpdateNotificationBanner` - P2 instructor notifications

## Design System

### Colors
- Primary: `#3b82f6` (Blue)
- Success: `#22c55e` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)

### Typography
- Font: Inter (system default)
- Sizes: 11px - 20px
- Weights: 400 (normal), 500 (medium), 700 (bold)

### Spacing
- 4px base unit
- Scale: 4, 8, 12, 16, 24, 32, 48px

## Technology Stack

- React 18.3.1
- React Router 7 (Data Mode)
- Tailwind CSS 4.1
- Radix UI Components
- date-fns for date formatting
- Sonner for toast notifications
- Motion for animations

## Getting Started

The application uses React Router's data mode pattern for navigation. All routes are defined in `/src/app/routes.tsx` and consumed by the main `App.tsx` component.

Navigate between pages using the header navigation or direct links.

## Key User Flows

1. **Publishing Changes**
   - Review pending changes in the table
   - View diffs for individual changes
   - Configure auto-push settings
   - Publish with real-time progress tracking
   - Receive success/failure notifications

2. **Authoring Content**
   - Edit page content in the authoring interface
   - Toggle between Draft and Ready status
   - Save changes as drafts
   - Preview before publishing

3. **Reviewing change history**
   - On the Publish tab, use Pending & Recent Changes (search, filters, recent changes table)
   - Open View Diff for a row to compare versions

4. **Instructor Experience**
   - Receive update notifications
   - View recent content changes
   - Monitor course sections and completion rates
