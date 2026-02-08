# User Manual

## Overview
Codex Gantt is a web-based project planning tool for creating and managing Gantt charts. It supports projects, tasks, version history, and shareable links.

## Getting Started
1. Open the app at `http://localhost:5173` (or your deployed URL).
2. Register a user account.
3. Create a project.
4. Add tasks to your project.

## Authentication
- Register: `Email + password` (minimum 8 characters).
- Login: Use the same credentials to obtain a session token.

## Projects
### Create a Project
1. Click **Create New Project**.
2. Enter a project name.
3. Choose whether the project is public.

### Update Project
1. Open a project.
2. Click the project name to edit.
3. Save changes automatically.

### Delete Project
1. Open the project menu.
2. Click **Delete**.
3. The project is soft-deleted and hidden from lists.

## Tasks
### Add a Task
1. Open a project.
2. Use **Quick Add** to create a task.
3. Set start date, end date, and optional color.

### Move or Resize Task
1. Drag the task bar to move it horizontally (changes dates).
2. Drag the left/right edges to resize the duration.

### Reorder Task
Use the position update endpoint or drag (if enabled in UI).

### Delete Task
1. Select a task.
2. Press `Delete` or click the delete action.

## Time Scales
Switch between:
- `Day`
- `Week`
- `Sprint` (2 weeks)
- `Month`
- `Quarter`

The header updates automatically based on the scale.

## Keyboard Shortcuts
- `Cmd/Ctrl + S` — Manual save
- `Cmd/Ctrl + Z` — Undo
- `Delete` — Delete selected task
- `Arrow Up/Down` — Navigate tasks

## Version History
1. Open **Version History** panel.
2. Review version list (timestamp, creator).
3. Restore a version or create a new snapshot.

## Share Links
### Create Link
1. Click **Share**.
2. Select access type (`readonly` or `editable`).
3. Set expiration (optional).

### Access Link
1. Open `/share/:token`.
2. The project opens without login, respecting link permissions.

### Revoke Link
1. Open Share modal.
2. Click **Revoke** on the link.

## Accessibility
- All interactive controls have ARIA labels.
- Keyboard navigation supported in Gantt view.
- Focus indicators are visible.

