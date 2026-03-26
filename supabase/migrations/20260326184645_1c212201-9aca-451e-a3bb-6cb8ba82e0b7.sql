
-- Fix overly permissive insert policies
-- Remove the broad system insert policies and make them more specific

-- Profiles: the handle_new_user trigger runs as SECURITY DEFINER so it bypasses RLS
-- We can safely drop the broad insert policy
DROP POLICY IF EXISTS "System can insert profile on signup" ON public.profiles;

-- User roles: same - trigger runs as SECURITY DEFINER
DROP POLICY IF EXISTS "System can insert role on signup" ON public.user_roles;

-- Notifications: restrict to inserting notifications for oneself or via triggers (SECURITY DEFINER)
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
