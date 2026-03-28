
-- Remove overly permissive insert policy, triggers use SECURITY DEFINER which bypasses RLS
DROP POLICY IF EXISTS "Allow trigger inserts" ON public.notifications;
