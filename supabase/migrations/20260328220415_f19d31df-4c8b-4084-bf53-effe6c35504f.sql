
-- Recreate all missing triggers

-- 1. Trigger for auto-creating profile + role on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger for updating updated_at on profiles
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Trigger for updating updated_at on subjects
CREATE OR REPLACE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger for updating updated_at on complaints
CREATE OR REPLACE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Trigger for notifying teacher when a new complaint is created
CREATE OR REPLACE TRIGGER on_complaint_created
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_teacher_on_complaint();

-- 6. Trigger for notifying student when complaint status changes
CREATE OR REPLACE TRIGGER on_complaint_status_change
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_student_on_status_change();
