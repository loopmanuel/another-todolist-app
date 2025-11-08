# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native todo list application built with Expo and Supabase. The app features task management with projects, lists, subtasks, labels, and priorities.

## Development Commands

### Running the App
- `npm start` - Start the Expo development server with dev client
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser

### Building
- `npm run prebuild` - Generate native projects with expo prebuild
- `npm run build:dev` - Create development build via EAS
- `npm run build:preview` - Create preview build via EAS
- `npm run build:prod` - Create production build via EAS

### Code Quality
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Auto-fix ESLint issues and format code with Prettier

### Database Types
- `npm run generate:types` - Generate TypeScript types from Supabase schema (requires Supabase CLI and project access)

## Architecture

### Navigation Structure (Expo Router)

The app uses file-based routing with protected routes:

```
app/
├── _layout.tsx                    # Root: QueryClient, UI providers
├── (root)/
│   ├── _layout.tsx               # Auth guard: routes to (auth) or (main) based on status
│   ├── (auth)/                   # Unauthenticated screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (main)/                   # Authenticated screens
│       ├── (tabs)/               # Bottom tab navigation (home, update)
│       ├── lists/[id].tsx        # List detail view
│       ├── lists/new.tsx         # Create list modal
│       ├── task/[id].tsx         # Task detail modal
│       └── task/new.tsx          # Create task modal
```

Navigation uses `Stack.Protected` guards (see app/(root)/_layout.tsx:29-34) to automatically route users based on authentication status from the auth store.

### State Management

**Authentication**: Zustand store (store/auth-store.ts)
- Manages session, user, and auth status ('loading' | 'authenticated' | 'unauthenticated')
- Subscribes to Supabase auth state changes
- Must call `initialize()` on app start

**Server State**: TanStack Query (React Query)
- All data fetching and mutations use React Query
- QueryClient configured in app/_layout.tsx:9
- Query keys follow a hierarchical pattern (e.g., taskKeys.project(id), taskKeys.task(id))

### Feature Organization

Features are organized by domain in the `features/` directory:

```
features/{domain}/
├── components/       # Feature-specific UI components
├── mutations/        # React Query mutations (use-create-*, use-update-*, use-delete-*)
├── queries/          # React Query queries (use-*, keys.ts)
└── validation/       # Zod schemas for forms
```

Example: `features/tasks/` contains all task-related queries, mutations, components, and validation schemas.

### Data Layer (Supabase)

- Client configured in utils/supabase.ts with AsyncStorage persistence
- TypeScript types auto-generated in supabase/database.types.ts
- Database schema includes: profiles, projects, tasks (with parent_id for subtasks), labels
- Use `Tables<'table_name'>` for row types, `TablesInsert<'table_name'>` for inserts

### UI & Styling

- **Styling**: NativeWind (Tailwind CSS for React Native) - use className prop
- **UI Library**: HeroUI Native (heroui-native) for base components
- **Forms**: React Hook Form + Zod for validation
- **Lists**: @shopify/flash-list for performant scrolling
- **Modals**: Stack navigation with presentation: 'modal' or 'formSheet'

### Path Aliases

The project uses path aliases configured in tsconfig.json:
- `@/*` - Maps to project root
- `~/*` - Maps to project root

Use these for all imports (e.g., `@/utils/supabase`, `@/features/tasks/...`)

## Common Patterns

### Creating a New Feature

1. Create feature folder: `features/{feature-name}/`
2. Add query keys in `queries/keys.ts` following hierarchical pattern
3. Create queries in `queries/use-*.ts` using React Query
4. Create mutations in `mutations/use-*.ts` with proper cache invalidation
5. Add Zod validation schemas in `validation/` if needed
6. Create feature components in `components/`

### Adding a New Screen

1. Create file in appropriate `app/` directory
2. Configure screen options in parent `_layout.tsx` if needed
3. Use Stack.Screen for modals with presentation props (see app/(root)/(main)/_layout.tsx for examples)

### Working with Forms

Forms use React Hook Form + Zod + @hookform/resolvers:
1. Define Zod schema in `features/{domain}/validation/`
2. Use `useForm` with `zodResolver`
3. Submit via React Query mutations
4. Mutations auto-invalidate relevant queries

### Query Invalidation

After mutations, invalidate queries using query keys:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) });
  queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(parentId) });
}
```

## Environment Variables

Required variables in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key

These are accessed via `process.env.EXPO_PUBLIC_*` (see utils/supabase.ts:4-5)
