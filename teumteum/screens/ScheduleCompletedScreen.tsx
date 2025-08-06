import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import ScheduleItem from '../components/ScheduleItem';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DebugDB from '@/components/DebugDB';
import { cleanUpOldSchedules } from '@/utils/scheduleUtils'
import { getDB, TaskDB, LongTermTask, RecommendedTask, DailySchedule } from '../storage/scheduleStorage';
import emitter from '@/storage/EventEmitter';

export default function ScheduleCompletedScreen() {
  const [taskDB, setTaskDB] = useState<TaskDB | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const router = useRouter();

  const refreshSchedules = async () => {
    const db = await getDB();
    if (db) setTaskDB(db);
  };

  useEffect(() => {
    refreshSchedules();
    cleanUpOldSchedules();
  }, []);

  useEffect(() => {
    emitter.on('scheduleChanged', refreshSchedules);
    return () => {
      emitter.off('scheduleChanged', refreshSchedules);
    };
  }, []);

  const handleConfirm = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setDatePickerVisibility(false);
  };

  if (!taskDB) return null;

  const { longTermTasks = [], recommendedTasks = [], dailySchedules = [] } = taskDB;

  const filteredLongTerm = longTermTasks.filter((task: LongTermTask) => task.isCompleted);
  const filteredRecommended = recommendedTasks.filter((task: RecommendedTask) => task.isCompleted);
  const filteredDaily = dailySchedules.filter(
    (task: DailySchedule) => task.isCompleted && task.date.slice(0, 10) === selectedDate
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} />
        <Text style={styles.title}>완료됨</Text>
        <IconButton icon="trash-can-outline" size={22} disabled style={{ opacity: 0 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.sectionTitle}>장기 일정</Text>
          {filteredLongTerm.map(task => (
            <ScheduleItem key={task.id} id={task.id} label={task.title} type='장기' isCompleted={true} />
          ))}
        </View>
        <View>
          <Text style={styles.sectionTitle}>추천 일정</Text>
          {filteredRecommended.map(task => (
            <ScheduleItem key={task.id} id={task.id} label={task.title} type='추천' isCompleted={true} />
          ))}
        </View>
        <View>
          <Pressable onPress={() => setDatePickerVisibility(true)}>
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
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />
          {filteredDaily.map(task => (
            <ScheduleItem key={task.id} id={task.id} label={task.title} type='일정' isCompleted={true} />
          ))}
        </View>
      </ScrollView>

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
});
