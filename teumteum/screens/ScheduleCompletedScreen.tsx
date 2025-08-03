import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScheduleItem from '../components/ScheduleItem';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ScheduleCompletedScreen() {
  const router = useRouter();
  
  const scheduleData = {
    장기: ['SW 대회', '운전면허', '컴활 자격증'],
    추천: ['영단어 암기', '자격증 공부', '스트레칭'],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} />
        <Text style={styles.title}>완료됨</Text>
        <IconButton icon="trash-can-outline" size={22} disabled style={{ opacity: 0 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {Object.entries(scheduleData).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.sectionTitle} key={category}>{category} 일정</Text>
            {items.map((item) => (
              <ScheduleItem label={item} />
            ))}
          </View>
        ))}
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
