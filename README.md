# TaskFlow — Mobile-First Task Management Web Application

TaskFlow is a responsive, mobile-first task management web application built with React, TypeScript, and Tailwind CSS. This project was developed as a portfolio project for a Mobile App Developer Intern role, with a focus on clean component hierarchy, accessible touch targets, type-safe data modeling, and reliable local persistence.

## Live Demo

**Live URL:** https://taskflow-app.ai.studio

## Key Features

### 1. Live Dashboard Summary

- Real-time dashboard counters for:
  - Total Tasks
  - Completed Tasks
  - Pending Workload
  - Overdue Tasks
- Visual progress bar showing overall task completion.
- Interactive analytics charts built with Recharts.
- Task distribution by Category and Priority.
- Bar Chart and Donut Chart toggle.
- Tooltips, filter chips, and collapsible chart controls.
- Clickable dashboard stat cards that filter the task list.

### 2. Full Task Creation & Validation

- Create tasks with a required title and character limit.
- Inline validation messages for invalid or missing input.
- Optional task description.
- Priority levels:
  - High — Rose
  - Medium — Amber
  - Low — Slate
- Task categories:
  - Work
  - Study
  - Personal
  - Health
  - Finance
  - Other
- Due-date presets:
  - Today
  - Tomorrow
  - +1 Week
  - Clear date

### 3. Task Editing & Safe Deletion

- Edit tasks through a modal with existing task details prefilled.
- Delete confirmation dialog displaying the task title.
- Undo toast appears for 6 seconds after deletion.
- Undo restores the deleted task to its exact previous position in the list.

### 4. Visual Completion Distinction

- Accessible task completion checkboxes with a 44px+ touch target.
- Completed tasks are visually distinguished using:
  - Strikethrough text
  - Muted background styling
  - Completion timestamp (`completedAt`)
- Task completion status is clearly visible throughout the application.

### 5. Visual Alert System & Urgency Indicators

- Urgent banner for overdue tasks and tasks due today.
- Rose-colored card accents for overdue tasks.
- Amber-colored card accents for tasks due today.
- Animated ping indicators to highlight urgent task status.

### 6. Local Calendar Navigation & Filtering

- Task filters include:
  - All Tasks
  - Today
  - Upcoming
  - Completed
  - Overdue
- Local date calculations use `YYYY-MM-DD` format.
- Date handling uses local date getters to avoid UTC timezone shifts.

### 7. Search & Combined Filters

- Search tasks by title and description.
- Combine search with category and priority filters.
- Filters work together to narrow down the task list.

### 8. Multi-Criteria Sorting

- Sort tasks by:
  - Due date ascending
  - Due date descending
  - Priority
  - Created date
  - Alphabetical order
- Tasks without a due date remain at the end when sorting by due date.

### 9. Fail-Safe LocalStorage Persistence

- Tasks are saved locally using `localStorage`.
- Safe JSON parsing prevents malformed stored data from crashing the app.
- `sanitizeTask` validates and sanitizes loaded task data.
- If `localStorage` is unavailable, the app falls back to in-memory state.

### 10. Smart Sample Dataset & Non-Reinsertion

- Five sample developer tasks are provided on first launch.
- Initialization is tracked using the `taskflow_has_initialized_v2` key.
- Sample tasks are not reinserted after users delete them.
- Manage Data controls allow users to reload or clear task data.

### 11. Mobile-First UX & Accessibility

- Responsive mobile-first layout.
- Bottom-sheet modal presentation on mobile.
- Centered modal presentation on desktop.
- Floating Action Button (FAB) for quick task creation.
- Accessible modal attributes such as `aria-modal`.
- Appropriate roles including `checkbox` and `alertdialog`.
- Keyboard support for Escape and Enter.
- Responsive layout tested for screens as narrow as 320px.
- No horizontal overflow on small mobile screens.

## Tech Stack

- **React 19**
- **TypeScript 7.0**
- **Tailwind CSS v4**
- **Recharts**
- **Lucide React**
- **Vite 8**

## Project Structure

```text
taskflow/
├── public/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup and Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/owaisibnmustafa/TaskFlow.git
```

### 2. Navigate to the Project Directory

```bash
cd taskflow
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local development URL in your browser:

```text
http://localhost:3000
```

### 5. Run Linting

```bash
npm run lint
```

### 6. Build for Production

```bash
npm run build
```

## Testing and Verification Guide

The following functionality has been tested and verified:

| Test | Expected Result |
|---|---|
| First Load | Sample tasks are initialized and displayed on first launch. |
| Create Task | A new task is created and appears in the task list. |
| Validation | Missing or invalid required fields display inline validation messages. |
| Mark Complete | Task completion status updates and completed styling is applied. |
| Edit Task | Existing task details are prefilled and saved changes are reflected. |
| Delete Task | Confirmation dialog displays the task title before deletion. |
| Undo | Deleted task is restored within the undo window. |
| Today Filter | Displays tasks due today. |
| Overdue Filter | Displays tasks with overdue due dates. |
| Pending Filter | Displays tasks that are not completed. |
| Undo Recovery | Restored task returns to its previous list position. |
| Safe JSON Import | Invalid or malformed stored data is handled safely. |
| Inline Clear Confirmation | Clear-data action requires confirmation before proceeding. |
| Remove Sample Data | Sample tasks can be removed without being reinserted on subsequent launches. |
| 320px Responsiveness | Layout remains usable without horizontal overflow on narrow mobile screens. |

## Limitations & Notes

- Task data is stored locally in the browser using `localStorage`.
- Tasks do not automatically sync across devices or browsers.
- Data can be transferred between environments using JSON export/import functionality.
- The application is designed with an offline-first approach and does not require a backend server for its core functionality.