import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import SkeletonContent from "../components/Skeleton";
import { COLORS, RADIUS, SHADOW_SM } from "../constants/theme";
import { SPORTS_DATA } from "../constants/sportsData";
import { getStudent } from "../db/database";
import { CONTENT_MAX_WIDTH, TABLET_BREAKPOINT } from "../constants/layout";

type Difficulty = "Easy" | "Medium" | "High";
type SportSection = "Activities" | "Exercises" | "Drills" | "Practice" | "Training";

const SPORT_SECTIONS: Array<{ key: SportSection; label: string }> = [
  { key: "Activities", label: "Sport Activities" },
  { key: "Exercises", label: "Exercises" },
  { key: "Drills", label: "Drills" },
  { key: "Practice", label: "Practice Tips" },
  { key: "Training", label: "Training Activities" },
];

interface DrillCardData {
  name: string;
  category: string;
  description: string;
  difficulty: Difficulty;
  durationMinutes: number;
}

const BASKETBALL_DRILLS: DrillCardData[] = [
  {
    name: "Cone Dribbling Course",
    category: "Dribbling",
    difficulty: "High",
    durationMinutes: 15,
    description: "Set up 8 cones in a zigzag. Dribble through at full speed, alternating hands. Builds ball control under game pressure.",
  },
  {
    name: "Stationary Control Series",
    category: "Dribbling",
    difficulty: "Easy",
    durationMinutes: 10,
    description: "Practice low, waist-high, crossover, and between-the-legs dribbles while keeping your eyes forward.",
  },
  {
    name: "Change-of-Pace Dribble",
    category: "Dribbling",
    difficulty: "Medium",
    durationMinutes: 12,
    description: "Alternate slow and explosive dribbles from baseline to baseline to improve control and acceleration.",
  },
  {
    name: "Mikan Drill",
    category: "Finishing",
    difficulty: "Medium",
    durationMinutes: 10,
    description: "Alternate layups from both sides of the basket without letting the ball touch the floor. Builds touch and finishing footwork.",
  },
  {
    name: "3-Man Weave",
    category: "Passing",
    difficulty: "High",
    durationMinutes: 20,
    description: "Three players run end-to-end in a weave passing pattern. Develops passing accuracy, timing, and team coordination.",
  },
  {
    name: "Defensive Slide Drill",
    category: "Defense",
    difficulty: "High",
    durationMinutes: 12,
    description: "Stay low and slide across the lane in short, quick steps without crossing your feet. Improves defensive positioning.",
  },
  {
    name: "Five-Spot Form Shooting",
    category: "Shooting",
    difficulty: "Medium",
    durationMinutes: 15,
    description: "Make controlled shots from five positions around the basket while maintaining consistent balance and follow-through.",
  },
  {
    name: "Full-Court Shuttle",
    category: "Conditioning",
    difficulty: "High",
    durationMinutes: 15,
    description: "Sprint between the baseline, free-throw line, half court, and opposite baseline to build basketball endurance.",
  },
];

const DIFFICULTY_STYLE: Record<Difficulty, { background: string; text: string }> = {
  Easy: { background: COLORS.green100, text: COLORS.green700 },
  Medium: { background: COLORS.yellow100, text: COLORS.yellow500 },
  High: { background: COLORS.red100, text: COLORS.red500 },
};

function categoryFromDrillName(name: string) {
  return name.replace(/\s+drill$/i, "").replace(/-/g, " ");
}

function buildSportDrills(sportName: string): DrillCardData[] {
  if (sportName === "Basketball") return BASKETBALL_DRILLS;

  const sport = SPORTS_DATA[sportName] ?? SPORTS_DATA.Basketball;
  const difficulties: Difficulty[] = ["Easy", "Medium", "High"];
  return sport.drills.map((drill, index) => ({
    name: drill.name,
    category: categoryFromDrillName(drill.name),
    description: `${drill.description} Focus on controlled technique and repeat with proper form.`,
    difficulty: difficulties[index % difficulties.length],
    durationMinutes: 10 + index * 5,
  }));
}

function DrillCard({ drill }: { drill: DrillCardData }) {
  const difficultyStyle = DIFFICULTY_STYLE[drill.difficulty];
  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.card,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.slate100,
        ...SHADOW_SM,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.slate800, fontSize: 14, fontFamily: "BricolageGrotesque_700Bold" }}>
            {drill.name}
          </Text>
          <Text
            style={{
              color: COLORS.navy,
              fontSize: 9,
              marginTop: 4,
              fontFamily: "BricolageGrotesque_700Bold",
              textTransform: "uppercase",
            }}
          >
            {drill.category}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 5 }}>
          <View
            style={{
              borderRadius: RADIUS.full,
              backgroundColor: difficultyStyle.background,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                color: difficultyStyle.text,
                fontSize: 9,
                fontFamily: "BricolageGrotesque_700Bold",
                textTransform: "uppercase",
              }}
            >
              {drill.difficulty}
            </Text>
          </View>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 10 }}>{drill.durationMinutes} min</Text>
        </View>
      </View>
      <Text
        style={{
          color: COLORS.slate500,
          fontSize: 12,
          lineHeight: 18,
          marginTop: 12,
          fontFamily: "BricolageGrotesque_400Regular",
        }}
      >
        {drill.description}
      </Text>
    </View>
  );
}

function SportCategoryList({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={{ backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: 16, borderWidth: 1, borderColor: COLORS.slate100, ...SHADOW_SM }}>
      <Text style={{ color: COLORS.slate800, fontSize: 15, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </Text>
      <View style={{ gap: 10 }}>
        {items.map((item, index) => (
          <View key={`${title}-${item}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 9999, backgroundColor: COLORS.orange50, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: COLORS.orange, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold" }}>{index + 1}</Text>
            </View>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 1, color: COLORS.slate600, fontSize: 12, lineHeight: 19 }}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SportDrillsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const [sportName, setSportName] = useState("Basketball");
  const [activeCategory, setActiveCategory] = useState("All Drills");
  const [activeSection, setActiveSection] = useState<SportSection>("Drills");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getStudent()
        .then((student) => {
          if (active && student?.sport && SPORTS_DATA[student.sport]) {
            setSportName(student.sport);
            setActiveCategory("All Drills");
            setActiveSection("Drills");
          }
        })
        .catch((error) => {
          console.error("Failed to load the assigned sport:", error);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const sport = SPORTS_DATA[sportName] ?? SPORTS_DATA.Basketball;
  const drills = useMemo(() => buildSportDrills(sport.name), [sport.name]);
  const categories = useMemo(() => ["All Drills", ...Array.from(new Set(drills.map((drill) => drill.category)))], [drills]);
  const visibleDrills = activeCategory === "All Drills" ? drills : drills.filter((drill) => drill.category === activeCategory);
  const activeSectionContent = activeSection === "Activities"
    ? { title: "Sport-Specific Activities", items: sport.activities }
    : activeSection === "Exercises"
      ? { title: "Exercises", items: sport.exercises }
      : activeSection === "Practice"
        ? { title: "Practice Suggestions", items: sport.practiceSuggestions }
        : activeSection === "Training"
          ? { title: "Training-Related Activities", items: sport.trainingActivities }
          : null;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="back" title="My Sport & Drills" />
        <SkeletonContent />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="back" title="My Sport & Drills" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingBottom: 28 }}>
        <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 18, paddingBottom: 20 }}>
          <View
            style={{
              backgroundColor: COLORS.navy800,
              borderRadius: RADIUS.card,
              padding: 16,
              flexDirection: "row",
              gap: 14,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.card,
                backgroundColor: COLORS.orange,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 32 }}>{sport.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 10,
                  fontFamily: "BricolageGrotesque_700Bold",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Assigned Sport
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: COLORS.white,
                  fontSize: 24,
                  fontFamily: "BricolageGrotesque_800ExtraBold",
                  textTransform: "uppercase",
                }}
              >
                {sport.name}
              </Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange100, fontSize: 10, marginTop: 3 }}>
                {drills.length} drills preloaded · offline
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: 14, borderWidth: 1, borderColor: COLORS.slate100, ...SHADOW_SM }}>
            <Text style={{ color: COLORS.orange, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase" }}>About the Sport</Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate600, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{sport.about}</Text>
            <View style={{ height: 1, backgroundColor: COLORS.slate100, marginVertical: 11 }} />
            <Text style={{ color: COLORS.orange, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase" }}>Origin / Development</Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate600, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{sport.sportsSpecificOrigin}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
            {SPORT_SECTIONS.map((section) => {
              const selected = activeSection === section.key;
              return (
                <TouchableOpacity
                  key={section.key}
                  onPress={() => setActiveSection(section.key)}
                  activeOpacity={0.78}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={{ minHeight: 36, borderRadius: RADIUS.full, borderWidth: 1, borderColor: selected ? COLORS.navy : COLORS.slate200, backgroundColor: selected ? COLORS.navy : COLORS.white, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ color: selected ? COLORS.white : COLORS.slate500, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase" }}>{section.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {activeSection === "Drills" ? (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {categories.map((category) => {
                  const selected = activeCategory === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setActiveCategory(category)}
                      activeOpacity={0.78}
                      style={{
                        minHeight: 32,
                        borderRadius: RADIUS.full,
                        borderWidth: 1,
                        borderColor: selected ? COLORS.orange : COLORS.slate200,
                        backgroundColor: selected ? COLORS.orange50 : COLORS.white,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: selected ? COLORS.orange : COLORS.slate500, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase" }}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
                {visibleDrills.map((drill) => (
                  <View key={drill.name} style={{ width: isTablet ? "49.2%" : "100%" }}>
                    <DrillCard drill={drill} />
                  </View>
                ))}
              </View>
            </>
          ) : activeSectionContent ? (
            <SportCategoryList title={activeSectionContent.title} items={activeSectionContent.items} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
