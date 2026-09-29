import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, View, ViewStyle } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import { CONTENT_MAX_WIDTH } from "../constants/layout";

interface SkeletonBlockProps {
  width?: ViewStyle["width"];
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBlock({ width = "100%", height, borderRadius = 8, style }: SkeletonBlockProps) {
  return <View style={[{ width, height, borderRadius, backgroundColor: COLORS.surfaceDeep }, style]} />;
}

interface SkeletonContentProps {
  variant?: "dashboard" | "list" | "profile";
}

export default function SkeletonContent({ variant = "list" }: SkeletonContentProps) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  if (variant === "profile") {
    return (
      <ScrollView accessibilityLabel="Loading profile" contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", opacity: pulse }}>
          <View style={{ backgroundColor: COLORS.navy, padding: 16, paddingBottom: 24, flexDirection: "row", gap: 16 }}>
            <SkeletonBlock width={80} height={80} borderRadius={RADIUS.card} style={{ backgroundColor: COLORS.navy800 }} />
            <View style={{ flex: 1, gap: 9, justifyContent: "center" }}>
              <SkeletonBlock width="72%" height={20} style={{ backgroundColor: COLORS.navy800 }} />
              <SkeletonBlock width="52%" height={11} style={{ backgroundColor: COLORS.navy800 }} />
              <SkeletonBlock width="42%" height={11} style={{ backgroundColor: COLORS.navy800 }} />
            </View>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <SkeletonBlock height={112} borderRadius={RADIUS.card} />
            <SkeletonBlock height={150} borderRadius={RADIUS.card} />
            <SkeletonBlock height={92} borderRadius={RADIUS.card} />
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  if (variant === "dashboard") {
    return (
      <ScrollView accessibilityLabel="Loading dashboard" contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", opacity: pulse }}>
          <View style={{ backgroundColor: COLORS.navy, padding: 16, paddingBottom: 42 }}>
            <View style={{ backgroundColor: COLORS.navy800, borderRadius: RADIUS.card, padding: 16, gap: 10 }}>
              <SkeletonBlock width="32%" height={10} style={{ backgroundColor: COLORS.navy600 }} />
              <SkeletonBlock width="58%" height={25} style={{ backgroundColor: COLORS.navy600 }} />
              <SkeletonBlock width="44%" height={11} style={{ backgroundColor: COLORS.navy600 }} />
            </View>
          </View>
          <View style={{ paddingHorizontal: 16, marginTop: -24, gap: 16 }}>
            <SkeletonBlock height={112} borderRadius={RADIUS.cardLg} style={{ backgroundColor: COLORS.white }} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <SkeletonBlock height={128} borderRadius={RADIUS.card} style={{ flex: 1 }} />
              <SkeletonBlock height={128} borderRadius={RADIUS.card} style={{ flex: 1 }} />
            </View>
            <SkeletonBlock height={160} borderRadius={RADIUS.card} />
            <SkeletonBlock height={94} borderRadius={RADIUS.card} />
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <ScrollView accessibilityLabel="Loading content" contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", padding: 16, paddingBottom: 100 }}>
      <Animated.View style={{ opacity: pulse, gap: 14 }}>
        <View style={{ gap: 8, marginBottom: 4 }}>
          <SkeletonBlock width="48%" height={24} />
          <SkeletonBlock width="68%" height={11} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <SkeletonBlock height={72} borderRadius={RADIUS.card} style={{ flex: 1 }} />
          <SkeletonBlock height={72} borderRadius={RADIUS.card} style={{ flex: 1 }} />
          <SkeletonBlock height={72} borderRadius={RADIUS.card} style={{ flex: 1 }} />
        </View>
        {[104, 116, 104, 116].map((height, index) => (
          <SkeletonBlock key={index} height={height} borderRadius={RADIUS.card} style={{ backgroundColor: COLORS.white }} />
        ))}
      </Animated.View>
    </ScrollView>
  );
}
