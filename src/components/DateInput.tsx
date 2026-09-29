import React, { useState } from "react";
import { Keyboard, Platform, Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { COLORS, RADIUS } from "../constants/theme";
import { formatDateInput, parseISODate, toDateInput } from "../utils/date";
import { IconCalendar } from "./icons";

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  onDateSelected?: () => void;
  placeholder?: string;
  error?: string | null;
  minimumDate?: Date;
  maximumDate?: Date;
}

function clampDate(date: Date, minimumDate?: Date, maximumDate?: Date) {
  if (minimumDate && date < minimumDate) return minimumDate;
  if (maximumDate && date > maximumDate) return maximumDate;
  return date;
}

export default function DateInput({
  value,
  onChangeText,
  onBlur,
  onDateSelected,
  placeholder = "YYYY/MM/DD",
  error,
  minimumDate,
  maximumDate,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerDate = clampDate(parseISODate(value) ?? new Date(), minimumDate, maximumDate);
  const displayValue = formatDateInput(value);

  const handleTextChange = (text: string) => {
    // When deleting an automatically inserted slash, delete the preceding
    // digit too so the user never gets stuck behind the date mask.
    if (displayValue.endsWith("/") && text === displayValue.slice(0, -1)) {
      onChangeText(formatDateInput(text.slice(0, -1)));
      return;
    }
    onChangeText(formatDateInput(text));
  };

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    onChangeText(toDateInput(selectedDate));
    onDateSelected?.();
  };

  return (
    <View>
      <View
        style={{
          width: "100%",
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: RADIUS.input,
          borderWidth: 1,
          borderColor: error ? COLORS.red500 : COLORS.slate200,
          backgroundColor: COLORS.slate50,
        }}
      >
        <TextInput
          value={displayValue}
          onChangeText={handleTextChange}
          onFocus={() => setShowPicker(false)}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.slate400}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={10}
          accessibilityLabel={`${placeholder} date input`}
          style={{
            flex: 1,
            paddingLeft: 16,
            paddingRight: 8,
            paddingVertical: 12,
            color: COLORS.slate700,
            fontSize: 14,
            fontFamily: "BricolageGrotesque_500Medium",
          }}
        />
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            setShowPicker(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open date picker"
          hitSlop={6}
          style={({ pressed }) => ({
            width: 48,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <IconCalendar size={20} color={error ? COLORS.red500 : COLORS.slate500} />
        </Pressable>
      </View>

      {error ? (
        <Text style={{ color: COLORS.red500, fontSize: 11, marginTop: 6, fontFamily: "BricolageGrotesque_500Medium" }}>
          {error}
        </Text>
      ) : null}

      {showPicker ? (
        <View>
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handlePickerChange}
          />
          {Platform.OS === "ios" ? (
            <Pressable
              onPress={() => setShowPicker(false)}
              accessibilityRole="button"
              style={({ pressed }) => ({ alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ color: COLORS.orange, fontFamily: "BricolageGrotesque_700Bold", fontSize: 14 }}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
