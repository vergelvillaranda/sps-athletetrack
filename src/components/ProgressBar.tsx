import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { COLORS, RADIUS } from "../constants/theme";

interface Props {
  value: number; // 0-100
  color?: string;
  height?: number;
}

export default function ProgressBar({ value, color = COLORS.orange, height = 8 }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(value, { duration: 700 });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={{ height, borderRadius: RADIUS.full, backgroundColor: COLORS.slate100, overflow: "hidden" }}>
      <Animated.View style={[{ height, borderRadius: RADIUS.full, backgroundColor: color }, animatedStyle]} />
    </View>
  );
}