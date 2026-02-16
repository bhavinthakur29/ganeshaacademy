# Ganesha Academy Dashboard

Next.js 15 (App Router) + TailwindCSS + shadcn/ui + Supabase

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (These are the only env vars used; `lib/supabase.js` reads them.)
3. Add PWA icons: `public/icons/icon-192.png` and `public/icons/icon-512.png`

## Tables (Supabase)

| Table        | Key columns                                                         |
|--------------|---------------------------------------------------------------------|
| students     | id, first_name, last_name, email_address, branch_name, branch_id   |
| branches     | id, name (or branch_name), address                                  |
| attendance   | id, student_id, date, status, branch_id                             |
| fees         | id, student_id, amount, due_date, status                            |
| instructors  | id, first_name, last_name, email_address, branch_id                  |
| orders       | id, student_id, total, status, created_at                           |

## Run

- `npm run dev` - Development
- `npm run build` && `npm start` - Production

## Routes

- `/` - Redirects to dashboard
- `/login` - Auth
- `/dashboard` - Overview stats
- `/students` - Students
- `/branches` - Branches
- `/attendance` - Attendance
- `/fees` - Fees
- `/instructors` - Instructors
- `/orders` - Orders
- `/profile` - User profile
