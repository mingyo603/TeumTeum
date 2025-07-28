import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScheduleItem from '../components/ScheduleItem';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScheduleCompletedScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={22} onPress={() => { /* 뒤로가기 로직 */ }} />
          <Text style={styles.title}>완료됨</Text>
          <IconButton icon="trash-can-outline" size={22} disabled style={{ opacity: 0 }} />
        </View>

        <Text style={styles.sectionTitle}>장기 일정</Text>
        <ScheduleItem label="SW 대회" checked />
        <ScheduleItem label="운전면허" checked />
        <ScheduleItem label="컴활 자격증" checked />

        <Text style={styles.sectionTitle}>추천 활동</Text>
        <ScheduleItem label="영단어 암기" checked />
        <ScheduleItem label="자격증 공부" checked />
        <ScheduleItem label="스트레칭" checked />
      </ScrollView>
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
});
