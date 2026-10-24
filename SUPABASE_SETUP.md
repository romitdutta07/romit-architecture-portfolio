# Supabase setup for this portfolio

## 1) Create Supabase project
- Go to https://supabase.com and create a free project.
- Copy the project URL and anon key from the Supabase dashboard.

## 2) Configure the site
- Open `supabase-config.js`.
- Replace the placeholder values with your real project URL and anon key.

## 3) Create the projects table
Run this SQL in the Supabase SQL editor:

```sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image_url text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Public can read projects"
on public.projects
for select
using (true);

create policy "Authenticated users can insert projects"
on public.projects
for insert
with check (auth.uid() is not null);

create policy "Authenticated users can update projects"
on public.projects
for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can delete projects"
on public.projects
for delete
using (auth.uid() is not null);
```

## 4) Create the admin user
- In the Supabase dashboard, go to Authentication > Users.
- Create a user with an email/password.
- Use that email + password in the admin login form.

## 5) Deploy
- Commit and push code to GitHub.
- GitHub Pages will serve the public portfolio.
- The admin login will work using Supabase Auth.

Note: the public page is static and safe to host on GitHub Pages. The secure admin part is protected by Supabase authentication and RLS.
