import * as SQLite from "expo-sqlite";
import { SCHEMA_SQL } from "./schema";
import { getBMIInfo } from "../utils/bmi";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const STUDENT_COLUMN_MIGRATIONS: ReadonlyArray<readonly [string, string]> = [
  ["first_name", "TEXT"],
  ["middle_name", "TEXT"],
  ["last_name", "TEXT"],
  ["birthday", "TEXT"],
  ["sex", "TEXT"],
  ["school", "TEXT"],
  ["school_year", "TEXT"],
  ["grade_level", "INTEGER"],
  ["section", "TEXT"],
  ["strand", "TEXT"],
  ["height_cm", "REAL"],
  ["weight_kg", "REAL"],
  ["sport", "TEXT"],
  ["sports_category", "TEXT"],
  ["coach", "TEXT"],
  ["student_id", "TEXT"],
  ["created_at", "TEXT"],
];

const GOAL_COLUMN_MIGRATIONS: ReadonlyArray<readonly [string, string]> = [
  ["goal_type", "TEXT"],
  ["category", "TEXT"],
  ["target", "TEXT"],
  ["start_date", "TEXT"],
  ["target_date", "TEXT"],
  ["action_plan", "TEXT"],
  ["progress", "INTEGER NOT NULL DEFAULT 0"],
  ["status", "TEXT NOT NULL DEFAULT 'active'"],
];

const ASSESSMENT_COLUMN_MIGRATIONS: ReadonlyArray<readonly [string, string]> = [
  ["assessment_phase", "TEXT NOT NULL DEFAULT 'pre-test'"],
];

function createBMIRecordData(heightCm: number, weightKg: number) {
  const bmiInfo = getBMIInfo(weightKg, heightCm);
  return {
    height: String(heightCm),
    weight: String(weightKg),
    bmi: String(bmiInfo.bmi),
    classification: bmiInfo.classification,
  };
}

async function openAndMigrateDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("athletetrack.db");
  await db.execAsync(SCHEMA_SQL);

  // CREATE TABLE IF NOT EXISTS does not update databases created with an
  // older version of the schema. Add every missing profile column explicitly
  // so existing installations keep their data and migrate in one pass.
  const studentColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(student)");
  const existingColumns = new Set(studentColumns.map(({ name }) => name));

  for (const [name, type] of STUDENT_COLUMN_MIGRATIONS) {
    if (!existingColumns.has(name)) {
      await db.execAsync(`ALTER TABLE student ADD COLUMN ${name} ${type}`);
    }
  }

  const goalColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(goal)");
  const existingGoalColumns = new Set(goalColumns.map(({ name }) => name));

  for (const [name, type] of GOAL_COLUMN_MIGRATIONS) {
    if (!existingGoalColumns.has(name)) {
      await db.execAsync(`ALTER TABLE goal ADD COLUMN ${name} ${type}`);
    }
  }

  const assessmentColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(assessment_record)");
  const existingAssessmentColumns = new Set(assessmentColumns.map(({ name }) => name));

  for (const [name, type] of ASSESSMENT_COLUMN_MIGRATIONS) {
    if (!existingAssessmentColumns.has(name)) {
      await db.execAsync(`ALTER TABLE assessment_record ADD COLUMN ${name} ${type}`);
    }
  }

  // Preserve the height and weight entered during onboarding as the first BMI
  // history entry for installations that predate BMI assessment tracking.
  const existingBMIRecord = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM assessment_record WHERE test_key = 'bmi' LIMIT 1`
  );
  if (!existingBMIRecord) {
    const student = await db.getFirstAsync<{ height_cm: number; weight_kg: number; created_at: string }>(
      `SELECT height_cm, weight_kg, created_at FROM student ORDER BY id DESC LIMIT 1`
    );
    if (student && student.height_cm > 0 && student.weight_kg > 0) {
      await db.runAsync(
        `INSERT INTO assessment_record (test_key, test_date, data) VALUES ('bmi', ?, ?)`,
        [student.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10), JSON.stringify(createBMIRecordData(student.height_cm, student.weight_kg))]
      );
    }
  }

  return db;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  // Cache initialization itself, not just the opened handle. This prevents a
  // second caller from using the database before migrations have completed.
  dbPromise ??= openAndMigrateDb().catch((error) => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

// ── Training Log ────────────────────────────────────────────────────────
export async function insertTrainingLog(log: {
  date: string;
  activity: string;
  durationMinutes: number;
  intensity: string;
  notes?: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO training_log (date, activity, duration_minutes, intensity, notes) VALUES (?, ?, ?, ?, ?)`,
    [log.date, log.activity, log.durationMinutes, log.intensity, log.notes ?? null]
  );
}

export async function getTrainingLogs() {
  const db = await getDb();
  return db.getAllAsync(`SELECT * FROM training_log ORDER BY date DESC`);
}

export async function updateTrainingLog(
  id: number,
  log: { date: string; activity: string; durationMinutes: number; intensity: string; notes?: string }
) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE training_log
     SET date = ?, activity = ?, duration_minutes = ?, intensity = ?, notes = ?
     WHERE id = ?`,
    [log.date, log.activity, log.durationMinutes, log.intensity, log.notes ?? null, id]
  );
}

export async function deleteTrainingLog(id: number) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM training_log WHERE id = ?`, [id]);
}

// ── Student / Profile ───────────────────────────────────────────────────
export async function insertStudent(student: {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: string;
  sex?: string;
  school?: string;
  schoolYear?: string;
  gradeLevel: number;
  section: string;
  strand?: string;
  heightCm: number;
  weightKg: number;
  sport: string;
  sportsCategory?: string;
  coach?: string;
  studentId: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO student (first_name, middle_name, last_name, birthday, sex, school, school_year, grade_level, section, strand, height_cm, weight_kg, sport, sports_category, coach, student_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student.firstName,
      student.middleName ?? null,
      student.lastName,
      student.birthday,
      student.sex ?? null,
      student.school ?? null,
      student.schoolYear ?? null,
      student.gradeLevel,
      student.section,
      student.strand ?? null,
      student.heightCm,
      student.weightKg,
      student.sport,
      student.sportsCategory ?? null,
      student.coach ?? null,
      student.studentId,
    ]
  );
  await db.runAsync(
    `INSERT INTO assessment_record (test_key, test_date, data) VALUES ('bmi', ?, ?)`,
    [new Date().toISOString().slice(0, 10), JSON.stringify(createBMIRecordData(student.heightCm, student.weightKg))]
  );
}

export async function getStudent() {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM student ORDER BY id DESC LIMIT 1`);
  return rows.length > 0 ? rows[0] : null;
}

export async function updateStudentStats(heightCm: number, weightKg: number) {
  const db = await getDb();
  const student = await getStudent();
  if (!student) return;
  await db.runAsync(`UPDATE student SET height_cm = ?, weight_kg = ? WHERE id = ?`, [heightCm, weightKg, student.id]);
}

export async function updateStudentHero(update: {
  firstName: string;
  lastName: string;
  gradeLevel: number;
  section: string;
}) {
  const db = await getDb();
  const student = await getStudent();
  if (!student) return;
  await db.runAsync(
    `UPDATE student SET first_name = ?, last_name = ?, grade_level = ?, section = ? WHERE id = ?`,
    [update.firstName, update.lastName, update.gradeLevel, update.section, student.id]
  );
}

// ── Goals ────────────────────────────────────────────────────────────────
export async function insertGoal(goal: {
  goalType: string; // "Fitness Goal" | "Sports Goal"
  category: string; // e.g. "Endurance", "Dribbling"
  target: string;
  startDate: string;
  targetDate: string;
  actionPlan?: string;
}) {
  const db = await getDb();
  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(goal)");
  const hasLegacyTitle = columns.some(({ name }) => name === "title");

  if (hasLegacyTitle) {
    // Older app versions created `title` as NOT NULL. Keep those databases
    // writable while storing all values used by the current goal UI.
    await db.runAsync(
      `INSERT INTO goal (title, goal_type, category, target, start_date, target_date, action_plan, progress, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
      [goal.target, goal.goalType, goal.category, goal.target, goal.startDate, goal.targetDate, goal.actionPlan ?? null]
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO goal (goal_type, category, target, start_date, target_date, action_plan, progress, status)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'active')`,
    [goal.goalType, goal.category, goal.target, goal.startDate, goal.targetDate, goal.actionPlan ?? null]
  );
}

export async function getGoals() {
  const db = await getDb();
  return db.getAllAsync<any>(`SELECT * FROM goal ORDER BY id DESC`);
}

export async function updateGoal(
  id: number,
  goal: {
    goalType: string;
    category: string;
    target: string;
    startDate: string;
    targetDate: string;
    actionPlan?: string;
  }
) {
  const db = await getDb();
  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(goal)");
  const hasLegacyTitle = columns.some(({ name }) => name === "title");

  if (hasLegacyTitle) {
    await db.runAsync(
      `UPDATE goal
       SET title = ?, goal_type = ?, category = ?, target = ?, start_date = ?, target_date = ?, action_plan = ?
       WHERE id = ?`,
      [goal.target, goal.goalType, goal.category, goal.target, goal.startDate, goal.targetDate, goal.actionPlan ?? null, id]
    );
    return;
  }

  await db.runAsync(
    `UPDATE goal
     SET goal_type = ?, category = ?, target = ?, start_date = ?, target_date = ?, action_plan = ?
     WHERE id = ?`,
    [goal.goalType, goal.category, goal.target, goal.startDate, goal.targetDate, goal.actionPlan ?? null, id]
  );
}

export async function markGoalComplete(id: number) {
  const db = await getDb();
  await db.runAsync(`UPDATE goal SET status = 'completed', progress = 100 WHERE id = ?`, [id]);
}

export async function moveGoalToProgress(id: number) {
  const db = await getDb();
  await db.runAsync(`UPDATE goal SET status = 'active', progress = 0 WHERE id = ?`, [id]);
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM goal WHERE id = ?`, [id]);
}

// ── Fitness Assessment ──────────────────────────────────────────────────
export async function insertAssessmentRecord(
  testKey: string,
  testDate: string,
  assessmentPhase: "pre-test" | "post-test",
  data: Record<string, string>
) {
  const db = await getDb();
  await db.runAsync(`INSERT INTO assessment_record (test_key, test_date, assessment_phase, data) VALUES (?, ?, ?, ?)`, [
    testKey,
    testDate,
    assessmentPhase,
    JSON.stringify(data),
  ]);
}

export async function updateAssessmentRecord(
  id: number,
  testDate: string,
  assessmentPhase: "pre-test" | "post-test",
  data: Record<string, string>
) {
  const db = await getDb();
  await db.runAsync(`UPDATE assessment_record SET test_date = ?, assessment_phase = ?, data = ? WHERE id = ?`, [
    testDate,
    assessmentPhase,
    JSON.stringify(data),
    id,
  ]);
}

export async function deleteAssessmentRecord(id: number) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM assessment_record WHERE id = ?`, [id]);
}

export async function getAssessmentRecords(testKey: string) {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM assessment_record WHERE test_key = ? ORDER BY test_date DESC, id DESC`,
    [testKey]
  );
  return rows.map((r) => ({ ...r, data: JSON.parse(r.data) as Record<string, string> }));
}
export async function getRecordedTestKeys() {
  const db = await getDb();
  const rows = await db.getAllAsync<{ test_key: string }>(`SELECT DISTINCT test_key FROM assessment_record`);
  return rows.map((r) => r.test_key);
}

export async function getLatestAssessmentRecords(limit = 4) {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM assessment_record ORDER BY id DESC LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({ ...row, data: JSON.parse(row.data) as Record<string, string> }));
}

// ── Wipe everything (Clear App Data) ────────────────────────────────────
export async function clearAllData() {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM student;
    DELETE FROM training_log;
    DELETE FROM goal;
    DELETE FROM assessment_record;
    DELETE FROM feedback;
  `);
}
