import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState([
    { time: '12:00 ~ 13:00', text: '점심 식사', checked: true },
    { time: '14:00 ~ 15:00', text: '영단어 암기', checked: false },
    { time: '14:00 ~ 15:00', text: '정기 회의', checked: false },
    { time: '15:00 ~ 16:00', text: '토익 공부', checked: false },
  ]);

  const toggleCheck = (index) => {
    const updated = [...schedule];
    updated[index].checked = !updated[index].checked;
    setSchedule(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.dateText}>2025.07.15</Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>🔔 7/15 정기 회의, 8/12 ○○ 작성</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.columnHeader}>시간</Text>
        <Text style={styles.columnHeader}>일정</Text>
      </View>

      <ScrollView>
        {schedule.map((item, index) => (
          <View key={index} style={styles.scheduleRow}>
            <Text style={styles.timeText}>{item.time}</Text>

            <Pressable
              onPress={() => toggleCheck(index)}
              style={[
                styles.scheduleItem,
                item.checked ? styles.checkedItem : styles.uncheckedItem,
              ]}
            >
              <Text style={styles.checkbox}>
                {item.checked ? '☑' : '☐'}
              </Text>
              <Text style={styles.scheduleText}>{item.text}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const PURPLE = '#7B52AA';
const LIGHT_PURPLE = '#A580C0';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dateText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#5C2E91',
    padding: 8,
    borderRadius: 4,
  },
  menuIcon: {
    fontSize: 24,
    color: 'white',
  },
  alertBox: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PURPLE,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  timeText: {
    width: 90,
    fontSize: 14,
    color: PURPLE,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  checkedItem: {
    backgroundColor: PURPLE,
  },
  uncheckedItem: {
    backgroundColor: LIGHT_PURPLE,
  },
  checkbox: {
    fontSize: 18,
    marginRight: 10,
    color: 'white',
  },
  scheduleText: {
    color: 'white',
    fontSize: 16,
  },
});