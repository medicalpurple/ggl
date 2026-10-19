# Anonymous messages (static site + Supabase + Vercel)

- `/` public page where anyone can send an anonymous message
- `/inbox` private inbox (Supabase Auth login) to read and delete messages

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor -> paste `supabase/schema.sql` -> Run.
3. Authentication -> Users -> **Add user** (your email + password, tick "Auto confirm").
4. Authentication -> Sign In / Providers -> turn **off "Allow new users to sign up"** so nobody else can register.
5. Project Settings -> API: copy the **Project URL** and the **anon / publishable key**.

## 2. Configure
Edit `config.js` with the URL and anon/publishable key. Never use the `service_role` key.

## 2b. Sender metadata (optional, for testing)
Run `supabase/migration-metadata.sql`. Messages are then saved through `api/send.js`, which records IP, device, OS, browser and approximate location.
In Vercel -> Project Settings -> Environment Variables add:
- `SUPABASE_URL` = your project URL
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (server-only, never commit it)

## 3. GitHub + Vercel
```bash
git init && git add . && git commit -m "anonymous messages"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```
Vercel -> Add New Project -> import the repo -> Framework Preset: **Other** -> Deploy.
Your link is `https://your-app.vercel.app/` and the inbox is `/inbox`.
