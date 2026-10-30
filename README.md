TaskFlow — Mobile-First Task Management Web Application

TaskFlow is a responsive, mobile-first task management web application built with React, TypeScript, and Tailwind CSS. Designed as a portfolio project for a Mobile App Developer Intern candidate, it emphasizes clean component hierarchy, accessible touch targets, type-safe data modeling, and robust local persistence.

🌐 Live Demo

Try TaskFlow here: "https://taskflow-app.ai.studio" (https://taskflow-app.ai.studio)

---

🚀 Key Features

1. Live Dashboard Summary
   
   - Real-time counters for Total Tasks, Completed Tasks, Pending Workload, and Overdue Tasks, derived dynamically from the task list.
   - Interactive visual completion progress bar with milestone indicators.
   - Interactive Recharts Visual Analytics: Integrated charts displaying task workload distribution by Category or Priority, with toggles between Bar Chart and Donut Chart views, custom tooltips, interactive filter chips, and collapsible controls.
   - Clickable stat cards that instantly filter the view (e.g., tap Overdue to jump straight to overdue items).

2. Full Task Creation & Validation
   
   - Required task title with character limit and inline validation (prevents empty/whitespace-only input).
   - Optional detailed description.
   - Priority levels: High (Rose), Medium (Amber), and Low (Slate) with clear visual pills.
   - Categorization: Work, Study, Personal, Health, Finance, and Other.
   - Due date selector with fast preset chips (Today, Tomorrow, +1 Week, Clear date).

3. Task Editing & Safe Deletion
   
   - In-place editing modal with prefilled values.
   - Accessible Delete Confirmation Modal displaying the task title to prevent accidental loss.
   - Instant Undo Toast: If a task is deleted, a temporary 6-second toast allows you to undo the deletion and restore the task to its exact position.

4. Visual Completion Distinction
   
   - Instant toggle with comfortable 44px+ touch target checkboxes.
   - Strikethrough title, muted background, and recorded "completedAt" timestamp.

5. Visual Alert System & Urgency Indicators
   
   - Urgent Action Summary Banner: Appears at the top of the task list when pending tasks are overdue or due today, displaying concise counts and clear action guidance.
   - Per-Task Card Edge Accents: Pending overdue tasks feature an assertive rose left border accent ("border-l-4 border-l-rose-500") and soft rose tint, while tasks due today feature an amber left border accent ("border-l-4 border-l-amber-500").
   - Pulsing Status Dots: Animated radar dots ("animate-ping") next to "Overdue" and "Due Today" badges for immediate peripheral awareness.

6. Local Calendar Navigation & Filtering
   
   - Dedicated filter tabs: All Tasks, Today, Upcoming, Completed, and Overdue.
   - Calendar calculations use local time ("YYYY-MM-DD" based on "d.getFullYear()", "d.getMonth() + 1", and "d.getDate()") to avoid UTC day-shift bugs.

7. Search & Combined Filters
   
   - Live search matching against both task titles and descriptions.
   - Seamlessly combines active search queries with category and priority dropdown filters.

8. Multi-Criteria Sorting
   
   - Due Date (Earliest first / Latest first) — tasks without due dates are placed at the end.
   - Priority (High to Low / Low to High) based on numeric weighting.
   - Created Date (Newest first / Oldest first).
   - Alphabetical (A - Z).

9. Fail-Safe LocalStorage Persistence
   
   - Safe "JSON.parse" with comprehensive object sanitization ("sanitizeTask") prevents crashes from corrupt or unexpected storage entries.
   - In-memory cache fallback if "localStorage" is blocked or unavailable (e.g., Safari private browsing quotas).

10. Smart Sample Dataset & Non-Reinsertion Guarantee
    
    - Includes 5 realistic developer tasks on the very first launch.
    - Tracked via "taskflow_has_initialized_v2". If sample tasks are deleted or cleared, they are never re-inserted on subsequent page refreshes.
    - User can deliberately reload demo data or clear all data via the Manage Data settings menu.

11. Mobile-First UX & Accessibility
    
    - Bottom sheet modal on mobile devices, centered dialog on tablets and desktops.
    - Mobile floating action button (FAB) for single-thumb task creation.
    - "aria-modal", "role="checkbox"", and "role="alertdialog"" attributes.
    - Keyboard-friendly: <kbd>Escape</kbd> closes modals, <kbd>Enter</kbd> submits forms.
    - No horizontal overflow at "320px" viewport width.

---

🛠️ Tech Stack

- Framework: React 19 (Functional components & Hooks)
- Language: TypeScript 7.0 (Strict mode, custom domain interfaces)
- Styling: Tailwind CSS v4 ("@import "tailwindcss";", Plus Jakarta Sans typography)
- Data Visualization: Recharts ("recharts")
- Icons: Lucide React ("lucide-react")
- Build Tool: Vite 8

---

📂 Project Structure

├── index.html                      # HTML5 entry with mobile viewport and Plus Jakarta font
├── metadata.json                   # App title and studio capabilities
├── package.json                    # Project scripts & dependencies
├── src/
│   ├── main.tsx                    # React DOM entry point
│   ├── index.css                   # Tailwind v4 import & custom scrollbar
│   ├── App.tsx                     # Main state container & filter/sort coordinator
│   ├── types/
│   │   └── task.ts                 # Type definitions (Task, Priority, Category, Stats)
│   ├── utils/
│   │   └── dateUtils.ts            # Local calendar date helpers (prevents UTC drift)
│   ├── services/
│   │   └── storageService.ts       # Type-safe localStorage persistence & sample data
│   └── components/
│       ├── Header.tsx              # Mobile header with brand, date & action buttons
│       ├── DashboardStats.tsx      # Interactive 4-metric summary cards & progress bar
│       ├── TaskFilterBar.tsx       # Search bar, view tabs, category/priority/sort pickers
│       ├── TaskCard.tsx            # Task item card with checkbox, tags, edit & delete
│       ├── TaskList.tsx            # Task rendering and contextual empty states
│       ├── TaskModal.tsx           # Create / Edit bottom sheet & modal form
│       ├── DeleteConfirmModal.tsx  # Accessible deletion confirmation modal
│       ├── SettingsModal.tsx       # Data backup/export, sample reload & wipe
│       ├── SampleDataBanner.tsx    # Demo dataset alert with one-click clear
│       └── Toast.tsx               # Feedback alert with Undo action
└── tsconfig.json                   # Strict TypeScript compiler options

---

⚙️ Setup and Running Locally

1. Clone or navigate to the directory:
   
   cd taskflow

2. Install dependencies:
   
   npm install

3. Start the local development server:
   
   npm run dev
   
   Open the local URL displayed by Vite in your browser.

4. Verify TypeScript compilation:
   
   npm run lint

5. Build for production:
   
   npm run build

---

🧪 Testing and Verification Guide

Feature| How to Test| Expected Behavior
First Load| Open app in a new incognito window| 5 demo developer tasks load, stats show 1 completed, 1 overdue, and welcome toast displays.
Create Task| Tap "+" or "New Task", enter "Test Mobile Auth", pick High priority & Health category| Task appears at the top; stats increment.
Validation| Try submitting a task with spaces only| Error message "Task title is required." appears; form does not submit.
Mark Complete| Tap the checkbox next to any pending task| Checkbox turns green, title strikes through, completed count increments.
Edit Task| Tap the pencil icon on a task| Modal opens with task data prefilled; saving updates the task and toast confirms change.
Delete & Confirmation| Tap the trash icon on a task| Confirmation dialog opens showing task title. Confirming deletes it.
Undo Deletion| Click "Undo" on the bottom toast within 6 seconds| Task is restored to its exact place in the list.
Today Filter| Tap "Today" tab| Only displays tasks whose due date equals the user's current local date.
Overdue Filter| Tap "Overdue" stat card or tab| Only shows pending tasks whose due date is before today.
Pending Filter| Tap "Pending" stat card or tab| Narrows task list to incomplete tasks; shows accurate pending count.
Undo Deletion Recovery| Delete task A, complete task B, then click "Undo"| Task A is restored without overwriting task B's completed status.
Safe JSON Import| Import JSON backup file via Settings| Sanitizes raw tasks, resolves duplicate IDs, and displays count toast without browser alerts.
Inline Clear Confirmation| Click "Clear Everything" in Settings| Shows "Yes, Delete All" inline confirmation with "Cancel" without browser confirm popups.
Remove Sample Data| Tap "Remove Sample Tasks" on the banner or in Settings| All sample tasks disappear; refresh the page and verify they do not reappear.
320px Responsiveness| Resize browser window to 320px wide| No horizontal scrollbars; form controls, buttons, and badges fit cleanly.

---

⚠️ Limitations & Notes

- Client-Side Storage: Data is saved to the local device's "window.localStorage". It does not sync across different browsers or separate devices without using the JSON Export / Import feature in the settings menu.
- Offline First: All operations are entirely local and do not require internet access or external API calls.