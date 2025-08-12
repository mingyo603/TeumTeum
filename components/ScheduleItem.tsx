import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import { toggleCompleted } from '@/storage/scheduleStorage';
import AddSchedulePopup from '@/components/AddSchedulePopup';
import emitter from '@/storage/EventEmitter'; 

interface Props {
  id: string;
  label: string;
  type: '장기' | '추천' | '일정';
  isCompleted: boolean;
  startTime?: string;
  endTime?: string;
  date?: string;
  dueDate?: string;
  duration?: number;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ScheduleItem({
  id,
  label,
  type,
  isCompleted,
  startTime,
  endTime,
  date,
  dueDate,
  duration,
  }: Props) {
  const [checked, setChecked] = useState(isCompleted);
  const [popupVisible, setPopupVisible] = useState(false);

  const handleToggle = async () => {
    const updatedTask = await toggleCompleted(type, id);
    if (updatedTask) {
      setChecked(updatedTask.isCompleted);
      await sleep(150); // 1초 (1000ms) 기다림
      // 변경 발생 알림 이벤트
      emitter.emit('scheduleChanged');
    }
  };
  const showPopup = () => setPopupVisible(true);

  return (
    <View style={styles.itemGroup}>
      <Pressable style={styles.container} onPress={handleToggle}>
        <Checkbox status={checked ? 'checked' : 'unchecked'} color={'#591A85'} />
        <Text style={styles.label}>{label}{' '}
          <Text style={styles.dateText}>
            {type === "장기"
              ? "~" + dueDate
              : type === "추천"
              ? duration + "분 소요"
              : startTime + "~" + endTime}
          </Text>
        </Text>
      </Pressable>
      <IconButton icon="information-outline" size={20} style={styles.icon} onPress={showPopup} />
      {popupVisible && (
        <AddSchedulePopup
          onClose={() => setPopupVisible(false)}
          initialValues={{
            Tab: type, 
            title: label,
            id: id,
            ...(type === '장기' && {
              dueDate: dueDate ? new Date(dueDate as string) : undefined,
            }),
            ...(type === '추천' && {
              duration: duration !== undefined ? duration.toString() : undefined,
            }),
            ...(type === '일정' && {
              dueDate: date ? new Date(date as string) : undefined,
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
  },
  itemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  dateText: {
    fontSize: 13,
  },
});
