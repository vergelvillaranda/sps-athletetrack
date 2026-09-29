export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS student (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  birthday TEXT NOT NULL,
  sex TEXT,
  school TEXT,
  school_year TEXT,
  grade_level INTEGER NOT NULL,
  section TEXT NOT NULL,
  strand TEXT,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  sport TEXT NOT NULL,
  sports_category TEXT,
  coach TEXT,
  student_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS training_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  activity TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS goal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_type TEXT NOT NULL,
  category TEXT NOT NULL,
  target TEXT NOT NULL,
  start_date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  action_plan TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessment_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_key TEXT NOT NULL,
  test_date TEXT NOT NULL,
  assessment_phase TEXT NOT NULL DEFAULT 'pre-test',
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  sender TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL
);
`;
