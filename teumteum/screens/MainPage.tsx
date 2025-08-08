// ScheduleScreenWithLongTerm.tsx
import React, { useState, useCallback, useEffect } from "react";
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
import { IconButton } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { cleanUpOldSchedules } from "@/utils/scheduleUtils";
import { getDB, TaskDB } from "@/storage/scheduleStorage";
import { generateDisplayTasksForDate, DisplayTask } from "@/utils/autoInsertRecommended"; // 📌 추가
import { MainDaily, MainRecommended } from '@/components/MainItem'; // 📌 MainDaily 컴포넌트 import
import { useDate } from '@/context/DateContext';  // 추가
import emitter from '@/storage/EventEmitter';

const PURPLE = "#7B52AA";

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

export default function ScheduleScreen() {
  const { selectedDate, setSelectedDate } = useDate();  // Context 사용
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [displayList, setDisplayList] = useState<DisplayTask[]>([]);
  const [longTermTasks, setLongTermTasks] = useState<any[]>([]);
  const [scheduleHeight, setScheduleHeight] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [taskDB, setTaskDB] = useState<TaskDB | null>(null);

  const router = useRouter();

  const refreshSchedules = async () => {
    const db = await getDB();
    if (!db) return;

    setTaskDB(JSON.parse(JSON.stringify(db)));
    setLongTermTasks(db.longTermTasks || []);

    // 추천 일정 자동 생성도 같이 갱신
    const list = await generateDisplayTasksForDate(selectedDate);
    setDisplayList(list);
  };

  useFocusEffect(
    useCallback(() => {
      refreshSchedules();
      cleanUpOldSchedules();
    }, [])
  );

  useEffect(() => {
    // 이벤트 구독
    emitter.on('scheduleChanged', refreshSchedules);
    return () => {
      emitter.off('scheduleChanged', refreshSchedules);
    };
  }, []);

  useFocusEffect(

    useCallback(() => {
      cleanUpOldSchedules();

      const loadAll = async () => {
        try {
          const db = await getDB();
          if (!db) return;

          // ✅ longTermTasks 상태 업데이트
          setLongTermTasks(db.longTermTasks || []);

          // ✅ 추천 일정 상태 업데이트
          const displayList = await generateDisplayTasksForDate(selectedDate);
          setDisplayList(displayList);

        } catch (e) {
          console.error("로드 실패", e);
          Alert.alert("오류", "일정 로드 중 문제가 발생했습니다.");
        }
      };

      loadAll();
    }, [selectedDate])
  );
  
  const handleConfirm = (date: Date) => {
    setSelectedDate(formatDate(date));
    setDatePickerVisibility(false);
  };

  const longTermTitles = longTermTasks
    .map(t => `${t.dueDate.slice(5, 10)} ${t.title}`)
    .join(", ");

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":".toString()).map(Number);
    return h * 60 + m;
  };

  const showPopup = () => setPopupVisible(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => setDatePickerVisibility(true)} style={styles.dateBox}>
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
      
      <Pressable onPress={() => router.push("/Manage")} style={styles.longTermTask}>
        <IconButton icon="bullhorn-outline" size={24} />
        <Text
          style={styles.longTermText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {longTermTitles || "없음"}
        </Text>
      </Pressable>

      <View style={styles.TapGroup}>
        <View style={[styles.RowGroup, styles.timeBox]}>
          <Text style={styles.columnHeader}>시간</Text>
        </View>
        <View style={[styles.verticalLine, { marginTop: 10, backgroundColor: "white" }]} />
        <View style={[styles.RowGroup, { flex: 1 }]}>
          <Text style={[styles.columnHeader]}>일정</Text>
        </View>
      </View>
      
      <ScrollView>
        {/* 이 안에서만 아이템 반복 */}
        {displayList.map((item, index) => {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const start = toMinutes(item.timeStart);
          const end = toMinutes(item.timeEnd);
          const current = nowMinutes >= start && nowMinutes < end;
          const backgroundColor = current
            ? PURPLE
            : "#A580C0";
          return (
            <View key={index} style={{ flexDirection: "row" }}>
              {/* 시간 블럭 */}
              <View style={[
                styles.timeBox, 
                { height: scheduleHeight-100 }, 
                { marginBottom: index === displayList.length - 1 ? 30 : 15 }, 
                ]}>
                {!item.isRecommended && (
                  <>
                    <Text style={styles.timeText}>{item.timeStart+'\n~\n'+item.timeEnd}</Text>
                  </>
                )}
              </View>
              
              <View
                style={[
                  styles.verticalLine,
                  { height: index === displayList.length - 1 ? scheduleHeight+100 : undefined },
                ]}
              />

              {/* 일정 블럭 */}
              {item.isRecommended ? (
                <MainRecommended
                  item={item}
                  current={current}
                  lastItem={index === displayList.length - 1}
                  backgroundColor={backgroundColor}
                />
              ) : (
                <MainDaily
                  lastItem={index === displayList.length - 1}
                  item={item}
                  backgroundColor={backgroundColor}
                />
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
    backgroundColor: "#FFFFFF", 
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0 
  },
  header: { 
    flexDirection: "row", 
    backgroundColor: PURPLE, 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16 
  },
  dateBox: { 
    padding: 8, 
  },
  dateText: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "white" 
  },
  timeBox: { 
    width: 70, 
    justifyContent: 'center', 
    marginTop: 15, 
    marginHorizontal: 16,
  },
  TapGroup: { 
    flexDirection: "row", 
    backgroundColor: "#fff", // <- 필수! (투명하면 그림자 안 나옴)
    shadowColor: '#000', // 그림자 색
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치
    shadowOpacity: 0.1, // 투명도
    shadowRadius: 3, // 블러 정도
    elevation: 3, // 안드로이드 전용 (숫자 클수록 진하고 높아짐)
  }, 
   RowGroup: {
    alignItems: "center", 
    marginVertical: 15, 
  }, 
  scheduleItem: { 
    flex: 1,  
    alignItems: "center", 
    flexDirection: "row", 
    minHeight: 30,
    marginVertical: 15, 
    marginHorizontal: 16,
    padding: 18, 
    borderWidth: 1, 
    borderRadius: 12,  
    borderColor: PURPLE, 
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
    alignSelf: "stretch", 
   },
  scheduleText: { 
    fontSize: 16, 
    flex: 1,
    color: PURPLE, 
    fontWeight: "bold"
   },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    marginRight: 8, // 필요 시 여백 조정
  },
  icon: {
    height: 24,
  },
  longTermTask: {
    paddingLeft: 6,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center', // ← 세로 정렬
    backgroundColor: '#f0f0f0',
  },
  longTermText: { 
    fontSize: 16, 
    fontWeight: "500", 
    flexShrink: 1
   },
  columnHeader: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: PURPLE
   },
});
