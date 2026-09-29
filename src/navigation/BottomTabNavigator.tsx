import React, { useEffect } from "react";
import { View, Pressable, Easing } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import DashboardScreen from "../screens/DashboardScreen";
import TrainingScreen from "../screens/TrainingScreen";
import GoalsScreen from "../screens/GoalsScreen";
import LearningHubScreen from "../screens/LearningHubScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { COLORS } from "../constants/theme";
import { IconHome, IconDumbbell, IconTarget, IconBook, IconUser } from "../components/icons";
import SafetyReminderToast from "../components/SafetyReminderToast";
import ResponsiveContainer from "../components/ResponsiveContainer";

export type BottomTabParamList = {
  Home: undefined;
  Training: undefined;
  Goals: undefined;
  Hub: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Home: IconHome,
  Training: IconDumbbell,
  Goals: IconTarget,
  Hub: IconBook,
  Profile: IconUser,
};

interface AnimatedTabButtonProps {
  label: string;
  isFocused: boolean;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
  onLongPress: () => void;
}

function AnimatedTabButton({ label, isFocused, Icon, onPress, onLongPress }: AnimatedTabButtonProps) {
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    focusProgress.value = withSpring(isFocused ? 1 : 0, {
      damping: 20,
      stiffness: 420,
      mass: 0.45,
      overshootClamping: true,
    });
  }, [focusProgress, isFocused]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -1 * focusProgress.value },
      { scale: pressScale.value * (1 + 0.035 * focusProgress.value) },
    ],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{ scaleX: focusProgress.value }],
  }));

  const inactiveIconStyle = useAnimatedStyle(() => ({ opacity: 1 - focusProgress.value }));
  const activeIconStyle = useAnimatedStyle(() => ({ opacity: focusProgress.value }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(focusProgress.value, [0, 1], [COLORS.slate400, COLORS.orange]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.94, { duration: 55 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, {
          damping: 20,
          stiffness: 500,
          mass: 0.4,
          overshootClamping: true,
        });
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${label} tab`}
      style={{ flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View style={[{ alignItems: "center", gap: 3 }, contentStyle]}>
        <View style={{ width: 22, height: 22 }}>
          <Animated.View style={[{ position: "absolute" }, inactiveIconStyle]}>
            <Icon size={22} color={COLORS.slate400} />
          </Animated.View>
          <Animated.View style={[{ position: "absolute" }, activeIconStyle]}>
            <Icon size={22} color={COLORS.orange} />
          </Animated.View>
        </View>
        <Animated.Text
          style={[
            { fontSize: 10, fontFamily: "BricolageGrotesque_600SemiBold" },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>
        <Animated.View
          style={[
            { width: 18, height: 3, borderRadius: 9999, backgroundColor: COLORS.orange, marginTop: 1 },
            indicatorStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: 7,
        paddingBottom: 20,
        paddingHorizontal: 8,
        shadowColor: "#0B2264",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      <ResponsiveContainer style={{ flexDirection: "row" }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => undefined);
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <AnimatedTabButton
            key={route.key}
            label={route.name}
            isFocused={isFocused}
            Icon={Icon}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
      </ResponsiveContainer>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          transitionSpec: {
            animation: "timing",
            config: { duration: 170, easing: Easing.out(Easing.cubic) },
          },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Training" component={TrainingScreen} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
        <Tab.Screen name="Hub" component={LearningHubScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <SafetyReminderToast />
    </View>
  );
}
