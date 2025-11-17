# Database Migration: Inbox Support

## Overview

This migration makes the `project_id` column in the `tasks` table nullable to support inbox tasks (tasks without an assigned project).

## Required Changes

### 1. Database Schema Update

Execute the following SQL in your Supabase SQL Editor:

```sql
ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;
```

This allows tasks to have a `null` value for `project_id`, representing tasks in the Inbox.

### 2. Regenerate TypeScript Types

After applying the migration, regenerate the database types:

```bash
npm run generate:types
```

This will update `supabase/database.types.ts` to reflect that `project_id` is now nullable.

## Why This Change Is Needed

The Inbox feature displays tasks that aren't assigned to any project. These are tasks where `project_id = null`. Previously, all tasks required a project assignment, but the Inbox workflow allows users to:

1. Create tasks quickly without selecting a project
2. View all unassigned tasks in one place (Inbox)
3. Move tasks from Inbox to projects later

## Impact on Existing Code

### Updated Files

The following files have been updated to support nullable `project_id`:

- `features/tasks/mutations/use-create-task.ts` - Made `projectId` optional in CreateTaskVariables
- `features/tasks/queries/use-inbox-tasks.ts` - Filters for `project_id = null`
- `app/(root)/(app)/task/new.tsx` - Defaults to Inbox (no project selected)
- `app/(root)/(app)/inbox.tsx` - New screen for viewing unassigned tasks

### Query Invalidation

The following mutations now invalidate inbox queries:

- `use-create-task` - Always invalidates inbox when creating tasks
- `use-update-task` - Invalidates inbox when updating `due_at` or `priority`
- `use-update-task-status` - Invalidates inbox when changing status
- `use-delete-task` - Invalidates inbox when deleting tasks

## Verification Steps

After applying the migration:

1. Create a new task without selecting a project (should default to "Inbox")
2. Navigate to the Inbox screen - task should appear in appropriate section (Overdue/Today/Unscheduled)
3. Move an inbox task to a project - should disappear from Inbox
4. Move a project task to Inbox - should appear in Inbox

## Rollback

If you need to rollback this change:

```sql
-- First, assign all inbox tasks to a default project
UPDATE tasks
SET project_id = (SELECT id FROM projects WHERE created_by = tasks.created_by LIMIT 1)
WHERE project_id IS NULL;

-- Then restore the NOT NULL constraint
ALTER TABLE tasks ALTER COLUMN project_id SET NOT NULL;
```

**Warning:** Rollback will require assigning all inbox tasks to projects first, which may not be desirable.
