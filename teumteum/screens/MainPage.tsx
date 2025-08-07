// ScheduleScreenWithLongTerm.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { IconButton, Checkbox } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { cleanUpOldSchedules } from "@/utils/scheduleUtils";
import { getDB, setDB } from "@/storage/scheduleStorage";

const PURPLE = "#7B52AA";
const LIGHT_PURPLE = "#A580C0";
const GRAY = "#CCCCCC";
const GRAY_TEXT = "#999";

interface ScheduleItem {
  timeStart: string;
  timeEnd: string;
  text: string;
  checked: boolean;
  isRecommended?: boolean;
  id?: string;
}

const getTodayString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":".toString()).map(Number);
  return h * 60 + m;
};

const toTimeStr = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function insertRecommendedTasks(daily: ScheduleItem[], recommended: any[]): ScheduleItem[] {
  const sortedDaily = [...daily].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  const result: ScheduleItem[] = [];
  const remainingRecommended = [...recommended];
  let lastEnd = 6 * 60;

  for (let i = 0; i <= sortedDaily.length; i++) {
    const current = sortedDaily[i];
    const currentStart = current ? toMinutes(current.timeStart) : 24 * 60;
    const gap = currentStart - lastEnd;

    for (let j = 0; j < remainingRecommended.length; j++) {
      const task = remainingRecommended[j];
      const durationMins = task.duration * 60;
      if (gap >= durationMins + 10) {
        const newTask: ScheduleItem = {
          timeStart: toTimeStr(lastEnd),
          timeEnd: toTimeStr(lastEnd + durationMins),
          text: `[추천] ${task.title}`,
          checked: false,
          isRecommended: true,
        };
        result.push(newTask);
        lastEnd += durationMins;
        remainingRecommended.splice(j, 1);
        j--;
      }
    }

    if (current) {
      result.push(current);
      lastEnd = toMinutes(current.timeEnd);
    }
  }

  return result;
}

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [visibleSchedule, setVisibleSchedule] = useState<ScheduleItem[]>([]);
  const [longTermTasks, setLongTermTasks] = useState<any[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [showLongTermList, setShowLongTermList] = useState<boolean>(false);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      cleanUpOldSchedules();

      const loadAll = async () => {
        try {
          const db = await getDB();
          if (!db) return;

          const isToday = (dateStr: string | Date) => formatDate(dateStr) === selectedDate;

          const daily = db.dailySchedules.filter(s => isToday(s.date));
          const dailyFormatted: ScheduleItem[] = daily.map(s => ({
            id: s.id,
            timeStart: s.startTime,
            timeEnd: s.endTime,
            text: s.title,
            checked: s.isCompleted,
            isRecommended: false,
          }));

          const recommended = db.recommendedTasks;
          const finalCombined = insertRecommendedTasks(dailyFormatted, recommended);
          setVisibleSchedule(finalCombined);

          const today = new Date(getTodayString());
          const longTermFiltered = db.longTermTasks.filter(
            t => !t.isCompleted && new Date(t.dueDate) >= today
          );
          setLongTermTasks(longTermFiltered);
        } catch (e) {
          console.error("로드 실패", e);
          Alert.alert("오류", "일정 로드 중 문제가 발생했습니다.");
        }
      };

      loadAll();
    }, [selectedDate])
  );

  const handleCheckboxToggle = async (item: ScheduleItem) => {
    if (!item.id) return;

    const db = await getDB();
    if (!db) return;

    const updatedSchedules = db.dailySchedules.map(s => {
      if (s.id === item.id) {
        return {
          ...s,
          isCompleted: !s.isCompleted,
          completedDate: !s.isCompleted ? new Date() : undefined,
        };
      }
      return s;
    });

    db.dailySchedules = updatedSchedules;
    await setDB(db);

    setVisibleSchedule(prev =>
      prev.map(p => (p.id === item.id ? { ...p, checked: !p.checked } : p))
    );
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(formatDate(date));
    setDatePickerVisibility(false);
  };

  const longTermTitles = longTermTasks.map(t => t.title).join(", ");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => setDatePickerVisibility(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{selectedDate}</Text>
        </Pressable>
        <IconButton
          icon="format-list-bulleted"
          size={24}
          iconColor="white"
          onPress={() => router.push("/Manage")}
        />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        pickerStyleIOS={{ backgroundColor: PURPLE }}
      />

      {/* ✅ 장기 일정 박스 통합됨 */}
      <View style={styles.longTermBox}>
        <Pressable
          onPress={() => router.push("/Manage")}
          style={styles.longTermToggle}
        >
          <Text style={styles.longTermIcon}>📢</Text>
          <Text
            style={styles.longTermText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {longTermTitles || "없음"}
          </Text>
        </Pressable>

        {showLongTermList && (
          <View style={styles.expandedBox}>
            {longTermTasks.length === 0 ? (
              <Text style={styles.longTermItemText}>장기 일정이 없습니다.</Text>
            ) : (
              longTermTasks.map(task => (
                <Pressable
                  key={task.id}
                  onPress={() => router.push("/Manage")}
                  style={styles.longTermItem}
                >
                  <Text style={styles.longTermItemText}>{task.title}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
        <View style={styles.scheduleRow}>
          <View style={styles.timeBox}>
            <Text style={[styles.columnHeader, styles.centerText]}>시간</Text>
          </View>
          <View style={[styles.verticalLine, { marginTop: 10 }]} />
          <View style={styles.scheduleHeaderBox}>
            <Text style={[styles.columnHeader, styles.centerText]}>일정</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          {visibleSchedule.map((item, index) => {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const start = toMinutes(item.timeStart);
            const end = toMinutes(item.timeEnd);
            const current = nowMinutes >= start && nowMinutes < end;

            const backgroundColor = item.checked
              ? GRAY
              : current
              ? PURPLE
              : LIGHT_PURPLE;
            const textColor = item.checked ? GRAY_TEXT : "white";

            return (
              <View key={item.id ?? `recommended-${index}`} style={styles.scheduleRow}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>{item.timeStart}</Text>
                  <Text style={styles.timeText}>~</Text>
                  <Text style={styles.timeText}>{item.timeEnd}</Text>
                </View>
                <View style={styles.verticalLine} />
                <Pressable
                  style={[styles.scheduleItem, { backgroundColor }]}
                  onPress={() => !item.isRecommended && handleCheckboxToggle(item)}
                >
                  {!item.isRecommended && (
                    <View style={{ marginRight: 6 }}>
                      <Checkbox
                        status={item.checked ? "checked" : "unchecked"}
                        color="#FFFFFF"
                        uncheckedColor="#FFFFFF"
                      />
                    </View>
                  )}
                  <Text numberOfLines={2} style={[styles.scheduleText, { color: textColor }]}>
                    {item.text}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0 },
  header: { flexDirection: "row", backgroundColor: PURPLE, justifyContent: "space-between", alignItems: "center", padding: 16 },
  dateButton: { backgroundColor: "#5C2E91", padding: 8, borderRadius: 4 },
  dateText: { fontSize: 28, fontWeight: "bold", color: "white" },
  longTermBox: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#f0f0f0" },
  longTermToggle: { flexDirection: "row", alignItems: "center" },
  longTermIcon: { fontSize: 18, marginRight: 6 },
  longTermText: { fontSize: 16, color: "#333", fontWeight: "500", flexShrink: 1 },
  expandedBox: { marginTop: 8, paddingVertical: 6 },
  longTermItem: { paddingVertical: 4 },
  longTermItemText: { fontSize: 15, color: PURPLE },
  scheduleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  timeBox: { width: 90, justifyContent: "center", alignItems: "center", paddingVertical: 14 },
  timeText: { fontSize: 15, fontWeight: "600", color: PURPLE, textAlign: "center" },
  verticalLine: { width: 1, backgroundColor: "#999", marginHorizontal: 8, alignSelf: "stretch" },
  scheduleItem: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 12, flex: 1, minHeight: 60 },
  scheduleText: { fontSize: 16, flexShrink: 1 },
  columnHeader: { fontSize: 16, fontWeight: "bold", color: PURPLE },
  scheduleHeaderBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerText: { textAlign: "center" },
});
