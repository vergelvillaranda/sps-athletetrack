export type TestCategory = "Health-Related" | "Skill-Related";

export interface TestField {
  key: string;
  label: string;
  unit?: string;
  calculated?: boolean;
}

export interface TestDefinition {
  key: string;
  name: string;
  testName?: string;
  category: TestCategory;
  emoji: string;
  description: string;
  fields: TestField[];
  primaryField: string; // which field is shown as the headline result on the card
  primaryUnit?: string;
  lowerIsBetter: boolean; // for the trend arrow's up/down color logic
}

export const ASSESSMENT_TESTS: TestDefinition[] = [
  // Health-Related Fitness
  {
    key: "bmi",
    name: "Body Composition",
    testName: "BMI",
    category: "Health-Related",
    emoji: "⚖️",
    description: "Body Mass Index uses the student's height and weight to estimate body composition and classify the result.",
    fields: [
      { key: "height", label: "Height", unit: "cm" },
      { key: "weight", label: "Weight", unit: "kg" },
      { key: "bmi", label: "BMI", calculated: true },
      { key: "classification", label: "Classification", calculated: true },
    ],
    primaryField: "bmi",
    lowerIsBetter: false,
  },
  {
    key: "step_test",
    name: "Cardiovascular Endurance",
    testName: "3-Minute Step Test",
    category: "Health-Related",
    emoji: "🫀",
    description: "The student steps up and down at a controlled pace for three minutes. Heart rate is recorded according to the test protocol.",
    fields: [
      { key: "hr_before", label: "Heart Rate Before", unit: "bpm" },
      { key: "hr_after", label: "Heart Rate After", unit: "bpm" },
    ],
    primaryField: "hr_after",
    primaryUnit: "bpm",
    lowerIsBetter: true,
  },
  {
    key: "push_up",
    name: "Muscular Strength",
    testName: "Push Up",
    category: "Health-Related",
    emoji: "💪",
    description: "The student performs as many correctly performed push-ups as required by the test protocol.",
    fields: [{ key: "reps", label: "Repetitions", unit: "reps" }],
    primaryField: "reps",
    primaryUnit: "reps",
    lowerIsBetter: false,
  },
  {
    key: "plank",
    name: "Muscular Endurance",
    testName: "Basic Plank",
    category: "Health-Related",
    emoji: "🧘",
    description: "The student holds the plank position while maintaining proper body alignment.",
    fields: [{ key: "time", label: "Holding Time", unit: "sec" }],
    primaryField: "time",
    primaryUnit: "sec",
    lowerIsBetter: false,
  },
  {
    key: "zipper",
    name: "Flexibility",
    testName: "Zipper Test",
    category: "Health-Related",
    emoji: "🤲",
    description: "The Zipper Test and Sit-and-Reach assess flexibility of different parts of the body.",
    fields: [
      { key: "right", label: "Right Side", unit: "cm" },
      { key: "left", label: "Left Side", unit: "cm" },
    ],
    primaryField: "right",
    primaryUnit: "cm",
    lowerIsBetter: false,
  },
  {
    key: "sit_reach",
    name: "Flexibility",
    testName: "Sit-and-Reach",
    category: "Health-Related",
    emoji: "🙆",
    description: "The Zipper Test and Sit-and-Reach assess flexibility of different parts of the body.",
    fields: [
      { key: "trial1", label: "First Trial", unit: "cm" },
      { key: "trial2", label: "Second Trial", unit: "cm" },
      { key: "best", label: "Best Score", unit: "cm" },
    ],
    primaryField: "best",
    primaryUnit: "cm",
    lowerIsBetter: false,
  },
  // Skill-Related Fitness
  {
    key: "juggling",
    name: "Coordination",
    testName: "Juggling",
    category: "Skill-Related",
    emoji: "🤹",
    description: "The student performs the required juggling task to assess coordination.",
    fields: [{ key: "score", label: "Score" }],
    primaryField: "score",
    lowerIsBetter: false,
  },
  {
    key: "hexagon",
    name: "Agility",
    testName: "Hexagon Agility Test",
    category: "Skill-Related",
    emoji: "⬡",
    description: "The student moves quickly around a hexagon pattern to assess the ability to change body position and direction.",
    fields: [
      { key: "clockwise", label: "Clockwise Time", unit: "sec" },
      { key: "counter", label: "Counterclockwise Time", unit: "sec" },
      { key: "average", label: "Average Time", unit: "sec", calculated: true },
    ],
    primaryField: "average",
    primaryUnit: "sec",
    lowerIsBetter: true,
  },
  {
    key: "sprint_40m",
    name: "Speed",
    testName: "40-Meter Sprint",
    category: "Skill-Related",
    emoji: "🏃",
    description: "The student runs 40 meters as quickly as possible while following the test protocol.",
    fields: [{ key: "time", label: "Time", unit: "sec" }],
    primaryField: "time",
    primaryUnit: "sec",
    lowerIsBetter: true,
  },
  {
    key: "long_jump",
    name: "Power",
    testName: "Standing Long Jump",
    category: "Skill-Related",
    emoji: "🦘",
    description: "The student jumps forward from a standing position. The distance measures lower-body explosive power.",
    fields: [
      { key: "trial1", label: "First Trial", unit: "cm" },
      { key: "trial2", label: "Second Trial", unit: "cm" },
      { key: "best", label: "Best Distance", unit: "cm" },
    ],
    primaryField: "best",
    primaryUnit: "cm",
    lowerIsBetter: false,
  },
  {
    key: "stork_balance",
    name: "Balance",
    testName: "Stork Balance Stand",
    category: "Skill-Related",
    emoji: "🦩",
    description: "The student balances on one foot for as long as possible according to the test protocol.",
    fields: [
      { key: "right", label: "Right-Foot Time", unit: "sec" },
      { key: "left", label: "Left-Foot Time", unit: "sec" },
    ],
    primaryField: "right",
    primaryUnit: "sec",
    lowerIsBetter: false,
  },
  {
    key: "stick_drop",
    name: "Reaction Time",
    testName: "Stick/Ruler Drop Test",
    category: "Skill-Related",
    emoji: "📏",
    description: "The student attempts to catch a falling stick/ruler as quickly as possible. The result provides an indication of reaction time.",
    fields: [
      { key: "trial1", label: "Trial 1", unit: "cm" },
      { key: "trial2", label: "Trial 2", unit: "cm" },
      { key: "trial3", label: "Trial 3", unit: "cm" },
      { key: "middle", label: "Middle Score", unit: "cm" },
    ],
    primaryField: "middle",
    primaryUnit: "cm",
    lowerIsBetter: true,
  },
];
