// ── Color tokens ─────────────────────────────────────────────────────────
export const COLORS = {
  navy: "#0B2264",
  navy800: "#163585",
  navy600: "#1E4BAA",

  orange: "#FF5F1F",
  orange50: "#FFF4EE",
  orange100: "#FFE4D3",

  surface: "#F1F4FA",
  background: "#F1F4FA", // alias of surface
  surfaceDeep: "#CBD5E8",
  white: "#FFFFFF",

  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",

  green500: "#16A34A",
  green100: "#DCFCE7",
  green700: "#15803D",

  red500: "#DC2626",
  red100: "#FEE2E2",

  yellow500: "#D97706",
  yellow100: "#FEF3C7",

  blue500: "#3B82F6",
  blue100: "#DBEAFE",
  blue700: "#1D4ED8",

  purple100: "#F3E8FF",
  purple700: "#7C3AED",

  amber100: "#FEF3C7",
  amber600: "#D97706",
};

export const GOAL_CATEGORY_COLORS = [
  "#3B82F6", "#8B5CF6", "#EF4444", "#10B981",
  "#F59E0B", "#06B6D4", "#EC4899", "#84CC16",
];

export function getGoalCategoryColor(index: number): string {
  return GOAL_CATEGORY_COLORS[index % GOAL_CATEGORY_COLORS.length];
}

export const SPACING = { 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 };

export const RADIUS = {
  xs: 4, sm: 8, input: 12, card: 16, onboardingLogo: 20, cardLg: 24, splashLogo: 28, full: 9999,
};

export const SHADOW_SM = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export const INTENSITY_COLORS: Record<string, { bg: string; text: string }> = {
  Light: { bg: COLORS.green100, text: COLORS.green500 },
  Moderate: { bg: COLORS.yellow100, text: COLORS.yellow500 },
  Vigorous: { bg: COLORS.red100, text: COLORS.red500 },
};

export const FEEDBACK_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Improvement: { bg: COLORS.green100, text: "#16A34A" },
  Consistency: { bg: COLORS.blue100, text: COLORS.blue700 },
  Milestone: { bg: COLORS.yellow100, text: COLORS.yellow500 },
  Reminder: { bg: COLORS.purple100, text: COLORS.purple700 },
};

export const AVAILABILITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Available: { bg: COLORS.green100, text: "#16A34A", dot: "#16A34A" },
  "In Use": { bg: COLORS.yellow100, text: "#D97706", dot: "#D97706" },
  Maintenance: { bg: COLORS.red100, text: "#DC2626", dot: "#DC2626" },
};

export const BMI_COLORS: Record<string, { emoji: string; color: string; bg: string }> = {
  Underweight: { emoji: "📉", color: "#3B82F6", bg: COLORS.blue100 },
  Normal: { emoji: "✅", color: "#16A34A", bg: COLORS.green100 },
  Overweight: { emoji: "⚠️", color: "#D97706", bg: COLORS.yellow100 },
  Obese: { emoji: "🔴", color: "#DC2626", bg: COLORS.red100 },
};

export const SPORTS = [
  "Swimming",
  "Athletics",
  "Basketball",
  "Badminton",
  "Chess",
  "Arnis",
  "Football",
  "Taekwondo",
  "Volleyball",
  "Sepak Takraw",
  "Wushu Sanda",
  "Wrestling",
  "Gymnastics",
] as const;

export const SPORT_EMOJI: Record<string, string> = {
  Swimming: "🏊",
  Athletics: "🏃",
  Basketball: "🏀",
  Badminton: "🏸",
  Chess: "♟️",
  Arnis: "🪃",
  Football: "⚽",
  Taekwondo: "🥋",
  Volleyball: "🏐",
  "Sepak Takraw": "🦵",
  "Wushu Sanda": "🥊",
  Wrestling: "🤼",
  Gymnastics: "🤸",
};

export const STRANDS = ["STEM", "ABM", "HUMSS", "GAS", "TVL", "Arts & Design", "Sports"] as const;
export const INTENSITIES = ["Light", "Moderate", "Vigorous"] as const;
export const ASSESSMENT_CATEGORIES = ["Strength", "Speed", "Endurance", "Flexibility"] as const;