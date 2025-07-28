import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScheduleItem from '../components/ScheduleItem';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScheduleManageScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={22} onPress={() => { /* 뒤로가기 로직 */ }} />
          <Text style={styles.title}>일정 관리</Text>
          <IconButton icon="trash-can-outline" size={22} />
        </View>

        <Text style={styles.sectionTitle}>장기 일정</Text>
        <ScheduleItem label="SW 대회" />
        <ScheduleItem label="운전면허" />
        <ScheduleItem label="컴활 자격증" />

        <Text style={styles.sectionTitle}>추천 활동</Text>
        <ScheduleItem label="영단어 암기" />
        <ScheduleItem label="자격증 공부" />
        <ScheduleItem label="스트레칭" />

        <Text style={styles.sectionTitle}>일일 일정</Text>
        <ScheduleItem label="친구 약속" />
        <ScheduleItem label="병원 예약" />
        <ScheduleItem label="수영 강습" />

      </ScrollView>
      <View style={styles.fabContainer}>
        <IconButton icon="plus" size={40} iconColor="#591A85" style={styles.fab} />
      </View>
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
});
