import React, { useCallback, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import Card from "../components/Card";
import SkeletonContent from "../components/Skeleton";
import { COLORS, RADIUS, FEEDBACK_TYPE_COLORS } from "../constants/theme";
import { getPerformanceFeedback, PerformanceFeedbackItem } from "../services/feedbackService";
import { CONTENT_MAX_WIDTH } from "../constants/layout";

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState<PerformanceFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    try {
      setFeedback(await getPerformanceFeedback());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeedback();
    }, [loadFeedback])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="back" title="Performance Feedback" />
        <SkeletonContent />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="back" title="Performance Feedback" />
      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingBottom: 24 }}>
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 16, backgroundColor: COLORS.blue100, borderRadius: RADIUS.input, padding: 12, flexDirection: "row", gap: 12 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 20 }}>🤖</Text>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.blue700, flex: 1, lineHeight: 17 }}>
            <Text style={{ fontFamily: "BricolageGrotesque_700Bold" }}>100% Offline AI. </Text>
            Feedback is generated on this device from your training and assessment history — nothing is uploaded.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {feedback.length === 0 ? (
            <Card>
              <Text style={{ fontFamily: "BricolageGrotesque_700Bold", fontSize: 15, color: COLORS.slate700, textAlign: "center" }}>Your first milestone is waiting</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, lineHeight: 18, color: COLORS.slate400, textAlign: "center", marginTop: 6 }}>
                Add a training log, complete a goal, or record a fitness assessment to see feedback here.
              </Text>
            </Card>
          ) : feedback.map((item) => {
            const colors = FEEDBACK_TYPE_COLORS[item.type];
            return (
              <Card key={item.id} style={{ opacity: item.unread ? 1 : 0.75 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: item.bg, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 18 }}>{item.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <View style={{ backgroundColor: colors.bg, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontFamily: "BricolageGrotesque_700Bold", color: colors.text, textTransform: "uppercase" }}>{item.type}</Text>
                      </View>
                      {item.unread ? <View style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: COLORS.orange }} /> : null}
                    </View>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 14, color: COLORS.slate700, lineHeight: 20 }}>{item.message}</Text>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400, marginTop: 8 }}>{item.timestamp}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.surface, borderRadius: RADIUS.input, padding: 12, borderWidth: 1, borderColor: COLORS.slate100 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate500 }}>
            💡 Feedback is generated automatically based on patterns in your training data — check back after each new log.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
