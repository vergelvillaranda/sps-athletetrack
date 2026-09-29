import { SPORTS_DATA } from "./sportsData";

export const FITNESS_GOAL_CATEGORIES = [
  "Endurance",
  "Strength",
  "Flexibility",
  "Agility",
  "Speed",
  "Balance",
  "Coordination",
  "Power",
  "Reaction Time",
];

export function getSportsGoalCategories(sportName: string): string[] {
  const sport = SPORTS_DATA[sportName];
  if (!sport) return ["Sport-Specific Skills"];

  return Array.from(new Set([...sport.activities, `Overall ${sport.name} Performance`]));
}
