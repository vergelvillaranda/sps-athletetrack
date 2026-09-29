import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import OnboardingPersonalInfo from "../screens/onboarding/PersonalInfo";
import OnboardingAcademicInfo from "../screens/onboarding/AcademicInfo";
import OnboardingPhysicalStats from "../screens/onboarding/PhysicalStats";
import OnboardingSportSelection from "../screens/onboarding/SportSelection";
import BottomTabNavigator from "./BottomTabNavigator";
import AssessmentScreen from "../screens/AssesmentScreen";
import SportDrillsScreen from "../screens/SportDrillsScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import { OnboardingProvider } from "../context/OnboardingContext";

export type RootStackParamList = {
  Splash: undefined;
  OnboardingPersonalInfo: undefined;
  OnboardingAcademicInfo: undefined;
  OnboardingPhysicalStats: undefined;
  OnboardingSportSelection: undefined;
  MainTabs: undefined;
  Assessment: undefined;
  Feedback: undefined;
  SportDrills: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <OnboardingProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "simple_push",
          animationDuration: 230,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationMatchesGesture: true,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
        <Stack.Screen name="OnboardingPersonalInfo" component={OnboardingPersonalInfo} />
        <Stack.Screen name="OnboardingAcademicInfo" component={OnboardingAcademicInfo} />
        <Stack.Screen name="OnboardingPhysicalStats" component={OnboardingPhysicalStats} />
        <Stack.Screen name="OnboardingSportSelection" component={OnboardingSportSelection} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ animation: "fade", animationDuration: 180 }} />
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="SportDrills" component={SportDrillsScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
