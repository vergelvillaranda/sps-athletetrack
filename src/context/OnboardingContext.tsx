import React, { createContext, useContext, useState, ReactNode } from "react";

interface OnboardingData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: string;
  sex: string | null;
  gradeLevel: number | null;
  section: string;
  strand: string | null;
  school: string;
  schoolYear: string;
  heightCm: string;
  weightKg: string;
  sport: string | null;
  coach: string;
}

const DEFAULTS: OnboardingData = {
  firstName: "",
  middleName: "",
  lastName: "",
  birthday: "",
  sex: null,
  gradeLevel: null,
  section: "",
  strand: null,
  school: "Basud National High School",
  schoolYear: "",
  heightCm: "",
  weightKg: "",
  sport: null,
  coach: "",
};

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULTS);
  const updateData = (partial: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...partial }));
  const reset = () => setData(DEFAULTS);
  return <OnboardingContext.Provider value={{ data, updateData, reset }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}