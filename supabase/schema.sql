-- Supabase Schema for Timetable Planner

-- Create roles ENUM
CREATE TYPE user_role AS ENUM ('super_admin', 'faculty', 'curriculum_designer', 'timetable_planner');

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'faculty',
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. Regulations Table
CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g. 'Regulation 2024'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

-- Policies for Curriculum Designer
CREATE POLICY "Regulations are viewable by all authenticated users."
  ON regulations FOR SELECT TO authenticated
  USING ( true );

CREATE POLICY "Curriculum Designers can manage regulations."
  ON regulations FOR ALL TO authenticated
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'curriculum_designer' );

-- 3. Batches Table
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id UUID REFERENCES regulations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. '2024 Batch'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (regulation_id, name)
);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Batches are viewable by all authenticated users."
  ON batches FOR SELECT TO authenticated
  USING ( true );

CREATE POLICY "Curriculum Designers can manage batches."
  ON batches FOR ALL TO authenticated
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'curriculum_designer' );

-- 4. Semesters Table
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. 'Odd Semester' or 'Semester 1'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (batch_id, name)
);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semesters are viewable by all authenticated users."
  ON semesters FOR SELECT TO authenticated
  USING ( true );

CREATE POLICY "Curriculum Designers can manage semesters."
  ON semesters FOR ALL TO authenticated
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'curriculum_designer' );

-- 5. Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Theory' CHECK (type IN ('Theory', 'Lab')),
  credits NUMERIC NOT NULL,
  classes_per_week INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (semester_id, code)
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subjects are viewable by all authenticated users."
  ON subjects FOR SELECT TO authenticated
  USING ( true );

CREATE POLICY "Curriculum Designers can manage subjects."
  ON subjects FOR ALL TO authenticated
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'curriculum_designer' );

-- 6. Labs Table
CREATE TABLE labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g. 'Computer Lab 1'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labs are viewable by all authenticated users."
  ON labs FOR SELECT TO authenticated
  USING ( true );

CREATE POLICY "Timetable Planners can manage labs."
  ON labs FOR ALL TO authenticated
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'timetable_planner' );

-- 7. Subject Faculty Mapping Table
CREATE TABLE subject_faculty_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES labs(id) ON DELETE SET NULL,
  classes_per_week INTEGER NOT NULL,
  continuous_hours INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subject_id, faculty_id)
);

ALTER TABLE subject_faculty_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subject faculty mappings are viewable by all authenticated users."
  ON subject_faculty_mapping FOR SELECT TO authenticated
  USING ( true );

CREATE POLICY "Timetable Planners can manage mappings."
  ON subject_faculty_mapping FOR ALL TO authenticated
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'timetable_planner' );

-- 8. Timetables Table
CREATE TABLE timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timetables viewable by all" ON timetables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Timetable planners can manage timetables" ON timetables FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'timetable_planner');

-- 9. Timetable Slots Table
CREATE TABLE timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  period_number INTEGER NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES labs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (timetable_id, day_of_week, period_number)
);

ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slots viewable by all" ON timetable_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Planners can manage slots" ON timetable_slots FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'timetable_planner');

-- 10. Working Days Table
CREATE TABLE working_days (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE, -- 1=Monday, 7=Sunday
  name TEXT NOT NULL,
  is_working BOOLEAN DEFAULT true
);

ALTER TABLE working_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Working days viewable by all" ON working_days FOR SELECT TO authenticated USING (true);
CREATE POLICY "Planners can manage working days" ON working_days FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'timetable_planner');

-- Insert default days
INSERT INTO working_days (day_of_week, name, is_working) VALUES 
(1, 'Monday', true), (2, 'Tuesday', true), (3, 'Wednesday', true), 
(4, 'Thursday', true), (5, 'Friday', true), (6, 'Saturday', false), (7, 'Sunday', false)
ON CONFLICT DO NOTHING;

-- 11. Time Slots Table
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  period_number INTEGER NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'Class' CHECK (type IN ('Class', 'Break', 'Lunch')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time slots viewable by all" ON time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Planners can manage time slots" ON time_slots FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'timetable_planner');

-- Insert default slots (7 periods)
INSERT INTO time_slots (period_number, type, start_time, end_time) VALUES 
(1, 'Class', '09:00', '09:50'), (2, 'Class', '09:50', '10:40'), 
(3, 'Break', '10:40', '11:00'), (4, 'Class', '11:00', '11:50'), 
(5, 'Class', '11:50', '12:40'), (6, 'Lunch', '12:40', '13:30'), 
(7, 'Class', '13:30', '14:20'), (8, 'Class', '14:20', '15:10'), (9, 'Class', '15:10', '16:00')
ON CONFLICT DO NOTHING;
