import { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { toggleLongTermTaskCompleted, toggleRecommendedTaskCompleted, toggleDailyScheduleCompleted } from '@/storage/scheduleStorage';
import { IconButton } from 'react-native-paper';


interface Props {
  id: string;
  label: string;
  type: '장기' | '추천' | '일일';
  isCompleted: boolean;
  color?: string;
  checked_color?: string;
}

export default function ScheduleItem({
  id,
  label,
  type,
  isCompleted,
  color = '#000',
  checked_color = '#591A85',
}: Props) {
  const [checked, setChecked] = useState(isCompleted);

  const handleToggle = async () => {
    let updatedTask;
    switch (type) {
      case '장기':
        updatedTask = await toggleLongTermTaskCompleted(id);
        break;
      case '추천':
        updatedTask = await toggleRecommendedTaskCompleted(id);
        break;
      case '일일':
        updatedTask = await toggleDailyScheduleCompleted(id);
        break;
    }
    if (updatedTask) {
      setChecked(updatedTask.isCompleted);
    }
  };
  const infotogle = async () => {
    let updatedTask;
    switch (type) {
      case '장기':
        updatedTask = await toggleLongTermTaskCompleted(id);
        break;
      case '추천':
        updatedTask = await toggleRecommendedTaskCompleted(id);
        break;
      case '일일':
        updatedTask = await toggleDailyScheduleCompleted(id);
        break;
    }
    if (updatedTask) {
      setChecked(updatedTask.isCompleted);
    }
  };

  return (
    <View style={styles.itemGroup}>
      <Pressable style={styles.container} onPress={handleToggle}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          color={checked_color}
        />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Pressable>
      <IconButton icon="information-outline" size={20} style={styles.icon} onPress={infotogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 'auto',
    marginRight: 0,
  },
});
