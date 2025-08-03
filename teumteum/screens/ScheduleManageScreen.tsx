import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import ScheduleItem from '../components/ScheduleItem';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddSchedulePopup from '@/components/AddSchedulePopup'; // 또는 상대경로
import { useRouter } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function ScheduleManageScreen() {
  const [isPopupVisible, setPopupVisible] = useState(false);

  const showPopup = () => setPopupVisible(true);
  const hidePopup = () => setPopupVisible(false);

  const router = useRouter();

  const getTodayString = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const handleConfirm = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setDatePickerVisibility(false);
  };

  const scheduleData = {
    장기: ['SW 대회', '운전면허', '컴활 자격증'],
    추천: ['영단어 암기', '자격증 공부', '스트레칭'],
    일일: ['친구 약속', '병원 예약', '수영 강습'],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} />
        <Text style={styles.title}>일정 관리</Text>
        <IconButton icon="trash-can-outline" size={22} onPress={() => router.push('/Completed')} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {Object.entries(scheduleData).map(([category, items]) => (
          <View key={category}>
            {category === '일일' ? (
              <>
                <Pressable onPress={() => setDatePickerVisibility(true)}>
                  <Text style={styles.sectionTitle}>
                    일일 일정{' '}
                      <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('ko-KR', {
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
              </>
            ) : (
              <Text style={styles.sectionTitle}>
                {category} 일정
              </Text>
            )}
            {items.map((item) => (
              <ScheduleItem label={item} />
            ))}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.fabContainer}>
        <IconButton icon="plus" size={40} iconColor="#591A85" style={styles.fab} onPress={showPopup}/>
      </View>

      {isPopupVisible && <AddSchedulePopup onClose={hidePopup} />}
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
