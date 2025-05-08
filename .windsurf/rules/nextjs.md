---
trigger: model_decision
description: NextJS, .tsx files
globs: *.tsx
---

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.

Key Principles

- , technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions

- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
- Favor server components and Next.js SSR.
- Use only for Web API access in small components.
- Avoid for data fetching or state management.

API

- Use server actions and remember to revalidade the path
- Use queries to handle CRUD operations

FORMS

- When making forms, follow the guide in [nextjs-forms.mdc](mdc:.cursor/rules/nextjs-forms.mdc)

### Component Architecture

- Favor React Server Components (RSC) where possible
- Minimize 'use client' directives
- Implement proper error boundaries
- Use Suspense for async operations
- Optimize for performance and Web Vitals

### State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage enhanced `useFormStatus` with new properties (data, method, action)
- Implement URL state management with 'nuqs'
- Minimize client-side state

### Async Request APIs

```typescript
// Always use async versions of runtime APIs
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Handle async params in layouts/pages
const params = await props.params;
const searchParams = await props.searchParams;
```

- useSearchParams() can be null, remember that.

### Data Fetching

- Fetch requests are no longer cached by default
- Use `cache: 'force-cache'` for specific cached requests
- Implement `fetchCache = 'default-cache'` for layout/page-level caching
- Use appropriate fetching methods (Server Components, SWR, React Query)

### Do not use route handlers unless the data needs to be accessed outside the aplication

- Use queries and server actions, remember to revalidade the path when necessary

### Route Handlers

```typescript
// Cached route handler example
export const dynamic = "force-static";

export async function GET(request: Request) {
  const params = await request.params;
  // Implementation
}
```

- Ensure that calls to useSearchParams() are wrapped in a Suspense boundary.

```
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Search() {
  const searchParams = useSearchParams()

  return <input placeholder="Search..." />
}

export function Searchbar() {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <Search />
    </Suspense>
  )
}
```

## Passing additional arguments to server actions

You can pass additional arguments to a Server Action using the JavaScript bind method.
app/client-component.tsx

```typescript

'use client'

import { updateUser } from './actions'

export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId)

  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update User Name</button>
    </form>
  )
}
```

```typescript
The Server Action will receive the userId argument, in addition to the form data:
app/actions.ts
TypeScript

'use server'

export async function updateUser(userId: string, formData: FormData) {}
```

    Good to know:

        An alternative is to pass arguments as hidden input fields in the form (e.g. <input type="hidden" name="userId" value={userId} />). However, the value will be part of the rendered HTML and will not be encoded.
        .bind works in both Server and Client Components. It also supports progressive enhancement.

### Next.js Config

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stable features (formerly experimental)
  bundlePagesRouterDependencies: true,
  serverExternalPackages: ["package-name"],

  // Router cache configuration
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};
```
