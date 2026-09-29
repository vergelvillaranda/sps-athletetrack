import { BMIInfo } from "../types";
import { parseISODate } from "./date";

export function computeAge(birthday: string): number {
  const birthDate = parseISODate(birthday);
  if (!birthDate) return NaN;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export function getBMIInfo(weightKg: number, heightCm: number): BMIInfo {
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const minNormalKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxNormalKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  let classification: BMIInfo["classification"];
  let color: string;
  let guidance: string;

  if (bmi < 18.5) {
    classification = "Underweight"; color = "#3B82F6";
    guidance = `Gain ${(minNormalKg - weightKg).toFixed(1)} kg to reach a normal range`;
  } else if (bmi < 25) {
    classification = "Normal"; color = "#22C55E";
    guidance = "Within the normal range — maintain current habits";
  } else if (bmi < 30) {
    classification = "Overweight"; color = "#F5821F";
    guidance = `Lose ${(weightKg - maxNormalKg).toFixed(1)} kg to reach a normal range`;
  } else {
    classification = "Obese"; color = "#EF4444";
    guidance = `Lose ${(weightKg - maxNormalKg).toFixed(1)} kg to reach a normal range`;
  }

  return { bmi, classification, color, guidance, normalWeightRangeKg: [minNormalKg, maxNormalKg] };
}
