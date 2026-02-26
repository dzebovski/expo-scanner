-- Clear all test data: companies and their image_assets.
-- Run this in Supabase SQL Editor (Database → SQL Editor) when you want to wipe test records.
-- RLS: run as a user with sufficient rights (e.g. service role or table owner).

-- Delete assets first (child table), then companies
DELETE FROM public.image_assets;
DELETE FROM public.companies;

-- Optional: reset sequences if you had any identity columns (companies.id is uuid default gen_random_uuid(), so no sequence)
-- To also empty Storage bucket files, do that in Dashboard → Storage or via Storage API.
