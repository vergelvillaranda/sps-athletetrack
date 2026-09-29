export type Sport =
  | "Basketball" | "Volleyball" | "Swimming" | "Athletics" | "Badminton" | "Football"
  | "Softball" | "Gymnastics" | "Taekwondo" | "Boxing" | "Table Tennis" | "Arnis";

export type Strand = "STEM" | "ABM" | "HUMSS" | "GAS" | "TVL" | "Arts & Design" | "Sports";
export type Intensity = "Low" | "Moderate" | "High" | "Max";
export type AssessmentCategory = "Strength" | "Speed" | "Endurance" | "Flexibility";
export type FeedbackType = "Drill" | "Performance" | "Recovery" | "Nutrition" | "Technique" | "General";

export interface Student {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: string;
  gradeLevel: number;
  section: string;
  strand?: Strand;
  heightCm: number;
  weightKg: number;
  sport: Sport;
  studentId: string;
  createdAt: string;
}

export interface TrainingLog {
  id: number;
  date: string;
  activity: string;
  durationMinutes: number;
  intensity: Intensity;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: number;
  category: string;
  title: string;
  targetDate: string;
  notes?: string;
  progress: number;
  status: "active" | "completed";
  createdAt: string;
}

export interface Assessment {
  id: number;
  category: AssessmentCategory;
  score: number;
  date: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: number;
  message: string;
  sender: string;
  date: string;
  type: FeedbackType;
}

export interface BMIInfo {
  bmi: number;
  classification: "Underweight" | "Normal" | "Overweight" | "Obese";
  color: string;
  guidance: string;
  normalWeightRangeKg: [number, number];
}