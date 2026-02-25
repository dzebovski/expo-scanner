# Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Run the schema**: In Dashboard → SQL Editor, run the contents of `migrations/001_initial_schema.sql`.
3. **Create Storage bucket**: In Dashboard → Storage, create a bucket named `company-assets` with public read access (so image URLs work for the app).
4. **Env**: Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (from Project Settings → API).
