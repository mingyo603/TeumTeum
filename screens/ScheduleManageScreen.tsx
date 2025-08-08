import AddSchedulePopup from '@/components/AddSchedulePopup';
import DebugDB from '@/components/DebugDB';
import MyCalendar from '@/components/MyCalendar';
import { useDate } from '@/context/DateContext'; // 추가
import emitter from '@/storage/EventEmitter';
import { cleanUpOldSchedules } from '@/utils/scheduleUtils';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScheduleItem from '../components/ScheduleItem';
import { DailyTask, getDB, initializeDB, LongTermTask, RecommendedTask, TaskDB } from '../storage/scheduleStorage';

export default function ScheduleManageScreen() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [taskDB, setTaskDB] = useState<TaskDB | null>(null);
  const [isCalendarVisible, setCalendarVisibility] = useState<boolean>(false);

  const { selectedDate, setSelectedDate } = useDate();  // Context 사용

  const router = useRouter();

  const refreshSchedules = async () => {
    const db = await getDB();
    setTaskDB(JSON.parse(JSON.stringify(db))); // 깊은 복사로 강제 트리거
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

  const showPopup = () => setIsPopupVisible(true);
  const hidePopup = () => setIsPopupVisible(false);

  if (!taskDB) {
    initializeDB()
    return null; // 여기서 바로 종료해야 TS가 이후에 taskDB가 null이 아님을 확신
  }

  const { longTermTasks = [], recommendedTasks = [], DailyTasks = [] } = taskDB;

  const filteredLongTerm = longTermTasks.filter((task: LongTermTask) => !task.isCompleted);
  const filteredRecommended = recommendedTasks.filter((task: RecommendedTask) => !task.isCompleted);
  const filteredDaily = DailyTasks.filter(
    (task: DailyTask) => !task.isCompleted && task.date.slice(0, 10) === selectedDate
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} />
        <Text style={styles.title}>일정 관리</Text>
        <IconButton icon="check-all" size={22} onPress={() => router.push('/Completed')} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.sectionTitle}>장기 일정</Text>
          {filteredLongTerm.map(task => (
            <ScheduleItem
              key={task.id}
              id={task.id}
              label={task.title}
              dueDate={task.dueDate}
              type='장기'
              isCompleted={false}
            />
          ))}
        </View>
        <View>
          <Text style={styles.sectionTitle}>추천 일정</Text>
          {filteredRecommended.map(task => (
            <ScheduleItem
              key={task.id}
              id={task.id}
              label={task.title}
              duration={task.duration}
              type='추천'
              isCompleted={false}
            />
          ))}
        </View>
        <View>
          <Pressable onPress={() => setCalendarVisibility(prev => !prev)}>
            <Text style={styles.sectionTitle}>
              일일 일정{' '}
              <Text style={styles.dateText}>
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).replace(/\.\s/g, '.').replace(/\.$/, '')}
              </Text>
            </Text>
          </Pressable>
          {
            isCalendarVisible && (
              <View style={styles.calendarContainer}>
                <MyCalendar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  setCalendarVisibility={setCalendarVisibility}
                  DailyTasks={taskDB.DailyTasks}  // 이걸 넘김
                />
              </View>
            )
          }
          {filteredDaily.map(task => (
            <ScheduleItem
              key={task.id}
              id={task.id}
              label={task.title}
              date={task.date}
              startTime={task.startTime}
              endTime={task.endTime}
              type='일정'
              isCompleted={false}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <IconButton icon="plus" size={40} iconColor="#591A85" style={styles.fab} onPress={showPopup} />
      </View>

      {isPopupVisible && (
        <AddSchedulePopup
          onClose={hidePopup}
        />
      )}

      <DebugDB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // 상태바 배경과 동일하게
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#591A85',
  },
  fabContainer: {
    position: 'absolute',
    right: 40,
    bottom: 48,
    backgroundColor: '#E7E2F1',
    width: 56,
    height: 56,
    borderRadius: 28,
    
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  fab: {
    backgroundColor: '#E7E2F1',
    borderRadius: 28,
    width: 56,
    height: 56,
    bottom: 5,
    right: 5,

    // iOS 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android 그림자
    elevation: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    flexDirection: 'row',
  },
  dateText: {
    fontSize: 13,
    color: '#591A85',
    fontWeight: 'medium',
  },
  dateButton: {
    backgroundColor: "#5C2E91",
    padding: 8,
    borderRadius: 4,
  },
  calendarContainer: {
  marginVertical: 10,
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: '#fff',
  elevation: 5,
},

});
