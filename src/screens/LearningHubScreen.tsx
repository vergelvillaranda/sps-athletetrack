import React, { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View, ViewStyle, StyleProp, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import SkeletonContent from "../components/Skeleton";
import { COLORS, RADIUS, SHADOW_SM } from "../constants/theme";
import { SPORTS_DATA, SportData } from "../constants/sportsData";
import { getStudent } from "../db/database";
import { CONTENT_MAX_WIDTH, TABLET_BREAKPOINT } from "../constants/layout";

interface LearningSectionProps {
  emoji: string;
  title: string;
  preview: string;
  tone?: "blue" | "orange" | "green";
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

interface LearningDetail {
  emoji: string;
  title: string;
  preview: string;
  description?: string;
  items?: string[];
  tone?: "blue" | "orange" | "green";
}

const SECTION_TONES = {
  blue: { icon: COLORS.blue100, accent: COLORS.blue700 },
  orange: { icon: COLORS.orange50, accent: COLORS.orange },
  green: { icon: COLORS.green100, accent: COLORS.green700 },
};

function LearningSection({ emoji, title, preview, tone = "blue", onPress, style }: LearningSectionProps) {
  const colors = SECTION_TONES[tone];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`View ${title}`}
      style={[{ minHeight: 150, borderRadius: RADIUS.cardLg, backgroundColor: COLORS.white, padding: 20, borderWidth: 1, borderColor: COLORS.slate100, justifyContent: "center", ...SHADOW_SM }, style]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: RADIUS.input,
            backgroundColor: colors.icon,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 23 }}>{emoji}</Text>
        </View>
        <Text
          style={{
            flex: 1,
            color: COLORS.slate800,
            fontSize: 16,
            lineHeight: 21,
            fontFamily: "BricolageGrotesque_800ExtraBold",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.accent, fontSize: 24, fontFamily: "BricolageGrotesque_700Bold" }}>›</Text>
      </View>

      <Text numberOfLines={2} style={{ color: COLORS.slate500, fontSize: 14, lineHeight: 21, marginTop: 12, fontFamily: "BricolageGrotesque_400Regular" }}>
        {preview}
      </Text>
      <Text style={{ color: colors.accent, fontSize: 11, marginTop: 10, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase" }}>
        Tap to view full details
      </Text>
    </TouchableOpacity>
  );
}

function LearningDetailModal({ detail, onClose }: { detail: LearningDetail | null; onClose: () => void }) {
  if (!detail) return null;
  const colors = SECTION_TONES[detail.tone ?? "blue"];

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close learning details"
        style={{ flex: 1, backgroundColor: "rgba(11,34,100,0.50)", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 36 }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{ width: "100%", maxWidth: 620, maxHeight: "84%", alignSelf: "center", borderRadius: RADIUS.cardLg, backgroundColor: COLORS.white, overflow: "hidden", ...SHADOW_SM }}
        >
          <View style={{ backgroundColor: COLORS.navy, padding: 20, flexDirection: "row", alignItems: "center", gap: 13 }}>
            <View style={{ width: 50, height: 50, borderRadius: RADIUS.input, backgroundColor: colors.icon, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 25 }}>{detail.emoji}</Text>
            </View>
            <Text style={{ flex: 1, color: COLORS.white, fontSize: 19, lineHeight: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase" }}>
              {detail.title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={{ width: 34, height: 34, borderRadius: RADIUS.full, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.white, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, gap: 15 }}>
            {detail.description ? (
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate600, fontSize: 15, lineHeight: 24 }}>{detail.description}</Text>
            ) : null}
            {detail.items?.map((item, index) => (
              <View key={`${detail.title}-${index}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <View style={{ width: 27, height: 27, borderRadius: RADIUS.full, backgroundColor: colors.icon, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.accent, fontSize: 11, fontFamily: "BricolageGrotesque_700Bold" }}>{index + 1}</Text>
                </View>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 1, color: COLORS.slate600, fontSize: 14, lineHeight: 22 }}>{item}</Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function LearningHubScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const [sportName, setSportName] = useState("Basketball");
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<LearningDetail | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getStudent()
        .then((student) => {
          if (active && student?.sport && SPORTS_DATA[student.sport]) setSportName(student.sport);
        })
        .catch((error) => {
          console.error("Failed to load selected sport for the learning hub:", error);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="dashboard" />
        <SkeletonContent />
      </View>
    );
  }

  const sport: SportData = SPORTS_DATA[sportName] ?? SPORTS_DATA.Basketball;
  const learningSections: LearningDetail[] = [
    { emoji: "📜", title: "Historical Origin and Development", preview: `Discover how ${sport.name} began and developed as a sport.`, description: sport.origin, tone: "orange" },
    { emoji: "🏟️", title: "Sports Facilities Information", preview: `Explore the facilities and playing areas used for ${sport.name}.`, items: sport.facilities },
    { emoji: "🎒", title: "Sports Equipment Information", preview: `Learn about the essential equipment used in ${sport.name}.`, items: sport.equipment, tone: "orange" },
    { emoji: "⚙️", title: "Uses and Functions", preview: "Understand how the facilities and equipment support training and play.", description: sport.usesFunctions },
    { emoji: "✅", title: "Proper Use and Safety", preview: `Review the important safety practices for ${sport.name}.`, items: sport.properUseSafety, tone: "green" },
    { emoji: "💡", title: "Sports-Related Learning Information", preview: `See the skills, rules, and knowledge students can learn in ${sport.name}.`, description: sport.learningInfo, tone: "orange" },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="dashboard" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingBottom: 28 }}>
        <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 20 }}>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={{ color: COLORS.white, fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", marginBottom: 14 }}
          >
            Sports Learning Hub
          </Text>

          <View
            style={{
              backgroundColor: COLORS.navy800,
              borderRadius: RADIUS.card,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: RADIUS.card,
                backgroundColor: COLORS.orange,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 32 }}>{sport.emoji}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 10,
                  fontFamily: "BricolageGrotesque_700Bold",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Selected Sport
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ color: COLORS.white, fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase" }}
              >
                {sport.name}
              </Text>
              <Text numberOfLines={2} style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange100, fontSize: 10, lineHeight: 14, marginTop: 3 }}>
                {sport.about}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 16, gap: 18 }}>
          <View
            style={{
              minHeight: 48,
              borderRadius: RADIUS.input,
              backgroundColor: COLORS.green100,
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: COLORS.green500 }} />
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 1, color: COLORS.green700, fontSize: 11, lineHeight: 15 }}>
              All {sport.name} learning resources are stored locally and available offline.
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}>
            {learningSections.map((section) => (
              <LearningSection key={section.title} {...section} onPress={() => setSelectedDetail(section)} style={{ width: isTablet ? "48.8%" : "100%" }} />
            ))}
          </View>
        </View>
      </ScrollView>
      <LearningDetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </View>
  );
}
