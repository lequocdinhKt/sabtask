-- =============================================================================
-- Fix nhanh: permission denied for schema public (42501)
-- Chạy 1 lần trên Supabase SQL Editor nếu app login được nhưng CRUD bị 403.
-- Không xoá dữ liệu.
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
