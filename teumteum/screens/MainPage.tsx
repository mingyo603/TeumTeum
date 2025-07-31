import React, { useState, useEffect } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const PURPLE = "#7B52AA";
const LIGHT_PURPLE = "#A580C0";

interface ScheduleItem {
  time: string;
  text: string;
  checked: boolean;
}

interface ScheduleData {
  [date: string]: ScheduleItem[];
}

const getTodayString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [visibleSchedule, setVisibleSchedule] = useState<ScheduleItem[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await AsyncStorage.getItem("scheduleData");
        const parsed: ScheduleData = raw ? JSON.parse(raw) : {};

        if (!parsed[selectedDate] || parsed[selectedDate].length === 0) {
          parsed[selectedDate] = [
            {
              time: "12:00 ~ 13:00",
              text: "당신을 위한 일정 관리 앱, 틈틈이",
              checked: false,
            },
          ];
          await AsyncStorage.setItem("scheduleData", JSON.stringify(parsed));
        }

        setVisibleSchedule(parsed[selectedDate]);
      } catch {
        Alert.alert("오류", "일정을 불러오는 데 실패했습니다.");
      }
    };

    loadData();
  }, [selectedDate]);

  const toggleCheck = async (index: number) => {
    const updated = [...visibleSchedule];
    updated[index].checked = !updated[index].checked;

    const raw = await AsyncStorage.getItem("scheduleData");
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[selectedDate] = updated;

    await AsyncStorage.setItem("scheduleData", JSON.stringify(parsed));
    setVisibleSchedule(updated);
  };

  const handleConfirm = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setDatePickerVisibility(false);
  };

   return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={() => setDatePickerVisibility(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{selectedDate}</Text>
        </Pressable>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        pickerStyleIOS={{ backgroundColor: PURPLE }}
      />

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>🔔 {selectedDate} 일정 확인하세요!</Text>
      </View>

      {/* 🔧 시간/일정 헤더를 일정 row와 구조 맞춤 */}
      <View style={styles.scheduleRow}>
        <View style={styles.timeBox}>
          <Text style={[styles.columnHeader, styles.centerText]}>시간</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.scheduleHeaderBox}>
          <Text style={[styles.columnHeader, styles.centerText]}>일정</Text>
        </View>
      </View>

      <ScrollView>
        {visibleSchedule.map((item, index) => (
          <View key={index} style={styles.scheduleRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <View style={styles.verticalLine} />
            <Pressable
              onPress={() => toggleCheck(index)}
              style={[
                styles.scheduleItem,
                item.checked ? styles.checkedItem : styles.uncheckedItem,
              ]}
            >
              <Text style={styles.checkbox}>{item.checked ? "☑" : "☐"}</Text>
              <Text numberOfLines={2} style={styles.scheduleText}>{item.text}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일 수정
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
  },
  header: {
    flexDirection: "row",
    backgroundColor: PURPLE,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dateButton: {
    backgroundColor: "#5C2E91",
    padding: 8,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  menuIcon: {
    fontSize: 24,
    color: "white",
  },
  alertBox: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  alertText: {
    fontSize: 14,
    color: "#333",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  timeBox: {
    width: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: PURPLE,
    textAlign: "center",
  },
  verticalLine: {
    width: 1,
    height: "100%",
    backgroundColor: "#999",
    marginHorizontal: 8,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    flex: 1,
    minHeight: 60,
  },
  checkedItem: {
    backgroundColor: PURPLE,
  },
  uncheckedItem: {
    backgroundColor: LIGHT_PURPLE,
  },
  checkbox: {
    fontSize: 20,
    marginRight: 12,
    color: "white",
  },
  scheduleText: {
    color: "white",
    fontSize: 16,
    flexShrink: 1,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: PURPLE,
  },
  scheduleHeaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    textAlign: "center",
  },
});