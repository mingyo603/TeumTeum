import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import { toggleLongTermTaskCompleted, toggleRecommendedTaskCompleted, toggleDailyScheduleCompleted } from '@/storage/scheduleStorage';
import AddSchedulePopup from '@/components/AddSchedulePopup';
import emitter from '@/storage/EventEmitter';  // 경로 맞춰서 import

interface Props {
  id: string;
  label: string;
  type: '장기' | '추천' | '일정';
  isCompleted: boolean;
  color?: string;
  checked_color?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  dueDate?: string;
  duration?: number;
}

export default function ScheduleItem({
  id,
  label,
  type,
  isCompleted,
  color = '#000',
  checked_color = '#591A85',
  startTime,
  endTime,
  date,
  dueDate,
  duration,
}: Props) {
  const [checked, setChecked] = useState(isCompleted);
  const [popupVisible, setPopupVisible] = useState(false);

  const handleToggle = async () => {
    let updatedTask;
    switch (type) {
      case '장기':
        updatedTask = await toggleLongTermTaskCompleted(id);
        break;
      case '추천':
        updatedTask = await toggleRecommendedTaskCompleted(id);
        break;
      case '일정':
        updatedTask = await toggleDailyScheduleCompleted(id);
        break;
    }
    if (updatedTask) {
      setChecked(updatedTask.isCompleted);
      // 변경 발생 알림 이벤트 발행
      emitter.emit('scheduleChanged');
    }
  };
  const showPopup = () => setPopupVisible(true);

  return (
    <View style={styles.itemGroup}>
      <Pressable style={styles.container} onPress={handleToggle}>
        <Checkbox status={checked ? 'checked' : 'unchecked'} color={checked_color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Pressable>
      <IconButton icon="information-outline" size={20} style={styles.icon} onPress={showPopup} />
      {popupVisible && (
        <AddSchedulePopup
          onClose={() => setPopupVisible(false)}
          onSave={() => {
            setPopupVisible(false);
            // 필요하면 여기서 refresh 이벤트 emit도 가능
            // 예: emitter.emit('scheduleChanged');
          }}
          initialTab={type}
          initialValues={{
            title: label,
            id: id,
            ...(type === '장기' && {
              endDate: dueDate ? new Date(dueDate as string) : undefined,
            }),
            ...(type === '추천' && {
              duration: duration !== undefined ? duration.toString() : undefined,
            }),
            ...(type === '일정' && {
              endDate: date ? new Date(date as string) : undefined,
              startTime: startTime ? new Date(`${date}T${startTime}:00`) : undefined,
              endTime: endTime ? new Date(`${date}T${endTime}:00`) : undefined,
            }),
          }}
        />
      )}
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
