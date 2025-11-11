# Task Manager - Menu Bar App

A simple Electron menu bar app for quickly capturing tasks.

## Setup

1. Install dependencies:
```bash
cd task-manager
npm install
```

2. Create an icon (optional):
   - Add a `icon.png` file (16x16 or 32x32 pixels) in the `task-manager` directory
   - If no icon is provided, Electron will use a default icon

## Running

```bash
npm start
```

The app will appear in your menu bar. Click the icon to open the task form.

## Usage

1. Click the menu bar icon
2. Enter your task in the input field (and optionally add due date, from, or description)
3. Press Enter or click "Add"
4. The task will be appended to `tasks.jsonl` in the task-manager directory

## Task Format

Tasks are written to `tasks.jsonl` in JSONL format (one JSON object per line):
```json
{"title":"Your task here","added":"2025-11-07T14:30:00.000Z","completed":false}
{"title":"Another task","added":"2025-11-07T14:31:00.000Z","completed":false,"dueDate":"2025-11-15","from":"Mark","description":"Some notes"}
```

Each task is a JSON object with:
- `title` (required): The task title
- `added` (required): ISO timestamp when the task was added
- `completed` (required): Boolean indicating if task is completed
- `dueDate` (optional): Due date in YYYY-MM-DD format
- `from` (optional): Person the task is from (Mark, Bart, or Nick)
- `description` (optional): Task description/notes

