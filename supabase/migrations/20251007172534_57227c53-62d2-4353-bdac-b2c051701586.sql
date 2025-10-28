-- Drop unsafe views that expose auth.users data
-- These views violate security best practices by exposing auth schema data

DROP VIEW IF EXISTS public.view_users_roles CASCADE;
DROP VIEW IF EXISTS public.view_users_with_roles CASCADE;

-- Applications should query profiles and user_roles tables directly instead
-- Example query to get user with roles:
-- SELECT p.*, array_agg(ur.role) as roles
-- FROM profiles p
-- LEFT JOIN user_roles ur ON ur.user_id = p.user_id
-- WHERE p.user_id = auth.uid()
-- GROUP BY p.id;

COMMENT ON TABLE public.profiles IS 'User profiles with restricted access. Query this table directly instead of using views that expose auth.users.';
COMMENT ON TABLE public.user_roles IS 'User roles mapping. Join with profiles table to get user information with roles.';