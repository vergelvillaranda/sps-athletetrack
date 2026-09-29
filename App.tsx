import "react-native-gesture-handler";
import React, { useCallback } from "react";
import { Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreenNative from "expo-splash-screen";
import {
  useFonts,
  BricolageGrotesque_200ExtraLight,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import RootNavigator from "./src/navigation/RootNavigator";
import { COLORS } from "./src/constants/theme";

SplashScreenNative.preventAutoHideAsync();

type FontDefaultComponent = {
  defaultProps?: { style?: unknown };
};

function applyGlobalBricolageFont() {
  const textComponent = Text as typeof Text & FontDefaultComponent;
  const inputComponent = TextInput as typeof TextInput & FontDefaultComponent;

  textComponent.defaultProps ??= {};
  inputComponent.defaultProps ??= {};
  textComponent.defaultProps.style = [{ fontFamily: "BricolageGrotesque_400Regular" }, textComponent.defaultProps.style];
  inputComponent.defaultProps.style = [{ fontFamily: "BricolageGrotesque_400Regular" }, inputComponent.defaultProps.style];
}

applyGlobalBricolageFont();

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_200ExtraLight,
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreenNative.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.navy }} onLayout={onLayout}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
