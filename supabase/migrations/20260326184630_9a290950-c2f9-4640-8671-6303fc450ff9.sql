
-- Role enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cne TEXT,
  filiere TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  grade NUMERIC(4,2) NOT NULL CHECK (grade >= 0 AND grade <= 20),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  teacher_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert profile on signup" ON public.profiles FOR INSERT WITH CHECK (true);

-- USER_ROLES policies
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert role on signup" ON public.user_roles FOR INSERT WITH CHECK (true);

-- SUBJECTS policies
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update subjects" ON public.subjects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subjects" ON public.subjects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- COMPLAINTS policies
CREATE POLICY "View own or assigned complaints" ON public.complaints FOR SELECT TO authenticated USING (
  auth.uid() = student_id OR auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Students can create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = student_id
);
CREATE POLICY "Teachers can update their complaints" ON public.complaints FOR UPDATE TO authenticated USING (
  auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can delete complaints" ON public.complaints FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to notify teacher on new complaint
CREATE OR REPLACE FUNCTION public.notify_teacher_on_complaint()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
  subject_name TEXT;
BEGIN
  SELECT first_name || ' ' || last_name INTO student_name FROM public.profiles WHERE user_id = NEW.student_id;
  SELECT name INTO subject_name FROM public.subjects WHERE id = NEW.subject_id;
  INSERT INTO public.notifications (user_id, message)
  VALUES (NEW.teacher_id, 'Nouvelle réclamation de ' || student_name || ' pour ' || subject_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_complaint_created
  AFTER INSERT ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.notify_teacher_on_complaint();

-- Trigger to notify student on complaint status change
CREATE OR REPLACE FUNCTION public.notify_student_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  subject_name TEXT;
  status_text TEXT;
BEGIN
  IF OLD.status != NEW.status THEN
    SELECT name INTO subject_name FROM public.subjects WHERE id = NEW.subject_id;
    IF NEW.status = 'accepted' THEN status_text := 'acceptée';
    ELSE status_text := 'rejetée';
    END IF;
    INSERT INTO public.notifications (user_id, message)
    VALUES (NEW.student_id, 'Votre réclamation pour ' || subject_name || ' a été ' || status_text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_complaint_status_changed
  AFTER UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.notify_student_on_status_change();
