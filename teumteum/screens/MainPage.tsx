// 생략된 import 문
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { IconButton, Checkbox } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { cleanUpOldSchedules } from "@/utils/scheduleUtils";
import { getDB, setDB } from "@/storage/scheduleStorage";
import { generateDisplayTasksForDate } from "@/utils/autoInsertRecommended"; // 📌 추가
import { DisplayTask } from '../utils/autoInsertRecommended'; // 경로는 실제 위치에 맞게 수정


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
  const [h, m] = time.split(":").map(Number);
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
  const [displayList, setDisplayList] = useState<DisplayTask[]>([]);

  const router = useRouter();

  useFocusEffect(

    useCallback(() => {
      cleanUpOldSchedules();

      const loadAll = async () => {
        try {
          const db = await getDB();
          if (!db) return;

          // 1. 추천 일정 DB에 삽입
          const displayList = await generateDisplayTasksForDate(selectedDate);
          setDisplayList(displayList); // 상태 업데이트

        } catch (e) {
          console.error("로드 실패", e);
        }
      };

      loadAll();
    }, [selectedDate])
  );

  const handleCheckboxToggle = async (item: ScheduleItem) => {
    if (!item.id) return;

    const db = await getDB();
    if (!db) return;

    const updatedSchedules = db.DailyTasks.map(s => {
      if (s.id === item.id) {
        return {
          ...s,
          isCompleted: !s.isCompleted,
          completedDate: !s.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return s;
    });

    db.DailyTasks = updatedSchedules;
    await setDB(db);

    setVisibleSchedule(prev =>
      prev.map(p => (p.id === item.id ? { ...p, checked: !p.checked } : p))
    );
  };

  const isCurrent = (item: ScheduleItem) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const start = toMinutes(item.timeStart);
    const end = toMinutes(item.timeEnd);
    return nowMinutes >= start && nowMinutes < end;
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(formatDate(date));
    setDatePickerVisibility(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Pressable onPress={() => setDatePickerVisibility(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{selectedDate}</Text>
        </Pressable>
        <IconButton icon="format-list-bulleted" size={24} iconColor="white" onPress={() => router.push("/Manage")} />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        pickerStyleIOS={{ backgroundColor: PURPLE }}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {displayList.map((item, index) => {
          const current = isCurrent(item);
          const backgroundColor = item.checked
            ? GRAY
            : current
            ? PURPLE
            : LIGHT_PURPLE;
          const textColor = item.checked ? GRAY_TEXT : "white";

          return (
            <View key={item.id ?? `r-${index}`} style={styles.scheduleRow}>
              <View style={styles.timeBox}>
                {!item.isRecommended ? (
                  <>
                    <Text style={styles.timeText}>{item.timeStart}</Text>
                    <Text style={styles.timeText}>~</Text>
                    <Text style={styles.timeText}>{item.timeEnd}</Text>
                  </>
                ) : null}
              </View>
              <View style={styles.verticalLine} />
              {item.isRecommended ? (
                <View style={[styles.scheduleItem, styles.backgroundColorRecommended]}>
                  <View style={styles.iconWrapper}>
                    <IconButton
                      icon="lightbulb-on-outline"
                      size={24}
                      onPress={() => {}}
                      style={styles.icon}
                    />
                  </View>
                  <Text style={[styles.scheduleText, styles.textRecommended]}>
                    {item.text}
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.scheduleItem, { backgroundColor }]}
                  onPress={() => handleCheckboxToggle(item)}
                >
                  <View style={styles.iconWrapper}>
                    <Checkbox
                      status={item.checked ? "checked" : "unchecked"}
                      color="white"
                      uncheckedColor="white"
                    />
                  </View>
                  <Text style={[styles.scheduleText, { color: textColor, fontWeight: "bold" }]}>
                    {item.text}
                  </Text>
                </Pressable>
              )}
            </View>

          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "white", 
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0 
  },
  header: { 
    flexDirection: "row", 
    backgroundColor: PURPLE, 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16 
  },
  dateButton: { 
    backgroundColor: "#5C2E91", 
    padding: 8, 
    borderRadius: 4 
  },
  dateText: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "white" 
  },
  scheduleRow: { 
    flexDirection: "row", 
    alignItems: "center", 
  },
  timeBox: { 
    width: 90, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 14, 
    marginBottom: 10 
  },
  timeText: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: PURPLE, 
    textAlign: "center"
   },
  verticalLine: { 
    width: 1, 
    backgroundColor: "#999", 
    marginHorizontal: 8, 
    alignSelf: "stretch"
   },
  scheduleItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 18, 
    borderRadius: 12, 
    flex: 1, 
    minHeight: 60, 
    marginBottom: 10 
   },
  scheduleText: { 
    fontSize: 16, 
    flexShrink: 1
   },
  backgroundColorRecommended: { 
    backgroundColor: "white", 
    borderColor: PURPLE, 
    borderWidth: 1, 
    borderRadius: 12,  // <- 추가
   },
  textRecommended: { 
    color: PURPLE, 
    fontWeight: "bold"
   },
  iconWrapper: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // 필요 시 여백 조정
  },
  icon: {
    width: 24,
    height: 24,
    color: '#5C2E91', // 보라색 아이콘
  },
});
