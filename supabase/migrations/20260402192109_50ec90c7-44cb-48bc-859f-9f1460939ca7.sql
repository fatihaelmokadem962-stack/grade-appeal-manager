
-- Drop old update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with admin access
CREATE POLICY "Users can update own profile or admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
