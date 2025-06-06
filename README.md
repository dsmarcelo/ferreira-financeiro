# Prime Financeiro

A financial management dashboard built with Next.js 15, TypeScript, and Supabase authentication.

## Features

- 📊 Financial dashboard with expense tracking
- 🔐 Secure authentication with Supabase
- 💰 Cash register management
- 📝 Personal and store expense tracking
- 🛍️ Product purchase management
- 📄 PDF report generation
- 🎨 Modern UI with Shadcn/UI and Tailwind CSS

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for authentication
- [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL
- [Shadcn/UI](https://ui.shadcn.com/) components
- [Tailwind CSS](https://tailwindcss.com) for styling

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd prime-financeiro
pnpm install
```

### 2. Set up Supabase Authentication

1. Create a new project at [Supabase](https://supabase.com/)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.local.template` to `.env.local`:
   ```bash
   cp .env.local.template .env.local
   ```
4. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```

### 3. Set up Database

```bash
# Set up your PostgreSQL database
pnpm db:push
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Authentication

The application uses Supabase for authentication with the following features:

- **Login Page**: `/login` - Users can sign in with email and password
- **Admin Page**: `/admin/criar-conta` - Protected page to create new user accounts
- **Protected Routes**: All main application routes require authentication
- **Auto-redirect**: Unauthenticated users are automatically redirected to login

### Creating User Accounts

1. Visit `/admin/criar-conta`
2. Enter the admin password: `0000`
3. Fill in the new user's email and password
4. The new user can then login at `/login`

> **Security Note**: In production, change the admin password and store it securely using environment variables.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── admin/             # Admin functionality
│   ├── auth/              # Auth confirmation handlers
│   └── _components/       # Shared components
├── components/ui/         # Shadcn/UI components
├── utils/supabase/        # Supabase client utilities
├── server/                # Server-side queries and actions
└── styles/                # Global styles
```

## Deployment

The application can be deployed on Vercel with minimal configuration:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

Make sure to set up your production Supabase project and update the environment variables accordingly.
