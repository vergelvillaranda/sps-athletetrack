import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";
import SafetyBanner from "./SafetyBanner";

const AUTO_DISMISS_MS = 30000;

export default function SafetyReminderToast() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.97, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [opacity, scale]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 220, mass: 0.7, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, opacity, scale]);

  if (!visible) return null;

  return (
    <Pressable
      onPress={dismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss safety reminder"
      accessibilityHint="Tap anywhere on the screen to dismiss"
      accessibilityLiveRegion="polite"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        elevation: 20,
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: "rgba(11,34,100,0.22)",
      }}
    >
      <Animated.View
        style={{
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
          opacity,
          transform: [{ scale }],
        }}
      >
        <SafetyBanner />
      </Animated.View>
    </Pressable>
  );
}
