# Supabase RLS Drift Audit

## Status

- Runtime backend access is not primarily protected by Supabase RLS because the Node server connects directly to the database and now also uses a service-role client for uploads.
- The tracked SQL in this repository still contains multiple historically permissive RLS definitions and should not be treated as a safe source of truth.
- The real acceptance point is the live Supabase dashboard export, which is still required.

## Tracked Risky SQL

- [supabase_migration_final.sql](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/supabase_migration_final.sql)
  Contains broad `USING (true)` policies for many tables including `projects`, `project_members`, `recruitments`, `applications`, `comments`, `reviews`, `schedules`, and `todos`.
- [supabase_migration_safe.sql](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/supabase_migration_safe.sql)
  Still grants effectively universal access through `IF NOT EXISTS` policies such as `Enable all access for projects`.
- [supabase_migration_ordered.sql](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/supabase_migration_ordered.sql)
  Contains the same permissive pattern.
- [(important)_supabase_clean_start.sql](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/(important)_supabase_clean_start.sql)
  Enables RLS and then grants full access on many tables.

## Operational Check Required

1. Export the live policies from the Supabase dashboard or `supabase db dump --schema public --data-only=false` equivalent.
2. Confirm whether the live project still has broad `USING (true)` policies on:
   - `users`
   - `projects`
   - `project_members`
   - `recruitments`
   - `applications`
   - `comments`
   - `reviews`
   - `schedules`
   - `todos`
3. If broad policies still exist, replace them with role- and ownership-scoped policies before relying on RLS for any frontend-direct path.
4. Treat the tracked SQL files above as migration history only until they are audited and superseded.

## Conclusion

- Code hardening reduced the main runtime exposure in the Node API.
- Live Supabase RLS is still unverified and cannot be assumed safe from this repository alone.
