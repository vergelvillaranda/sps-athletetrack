import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/theme";
import { getStudent } from "../db/database";
import { Image } from "react-native";

function PinIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s7-7.58 7-12.5A7 7 0 105 9.5C5 14.42 12 22 12 22z" fill="rgba(255,255,255,0.35)" />
    </Svg>
  );
}

function Dot({ delay }: { delay: number }) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(-6, { duration: 450 }), withTiming(0, { duration: 450 })), -1, false)
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return <Animated.View style={[{ width: 10, height: 10, borderRadius: 9999, backgroundColor: COLORS.orange }, style]} />;
}

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const existingStudent = await getStudent();
      if (existingStudent) {
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      } else {
        navigation.replace("OnboardingPersonalInfo");
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center", gap: 28 }}>
      <View
        style={{
          width: 112,
          height: 112,
          borderRadius: 24,
          backgroundColor: COLORS.navy800,
          borderWidth: 4,
          borderColor: "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={require("../../assets/images/logosps.jpeg")}
          style={{ width: 76, height: 76, borderRadius: 14 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ alignItems: "center", paddingHorizontal: 32 }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 46,
            lineHeight: 46,
            fontFamily: "BricolageGrotesque_800ExtraBold",
            textTransform: "uppercase",
            letterSpacing: -0.4,
            textAlign: "center",
          }}
        >
          SPS AthleteTrack
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.40)", fontSize: 14, marginTop: 12, fontFamily: "BricolageGrotesque_400Regular" }}>
          Basud National High School
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
          <PinIcon />
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "BricolageGrotesque_500Medium" }}>
            Basud, Camarines Norte
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
        <Text
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 11,
            marginTop: 8,
            textTransform: "uppercase",
            letterSpacing: 2,
            fontFamily: "BricolageGrotesque_500Medium",
          }}
        >
          Loading your profile…
        </Text>
      </View>
    </View>
  );
}
