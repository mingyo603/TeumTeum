// components/time/TimeRangePicker.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  time: Date;
  onChange: (start: Date, end: Date) => void;
}

const TimeRangePicker: React.FC<Props> = ({ label, time, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isPickingStart, setIsPickingStart] = useState(true);

  // 임시 저장용
  const [tempStart, setTempStart] = useState(time);
  const [tempEnd, setTempEnd] = useState(time);

  // 시간 표시 포맷
  const formatTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')} : ${String(date.getMinutes()).padStart(2, '0')}`;

  const onChangePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      setIsPickingStart(true); // 초기화
      return;
    }

    if (selectedDate) {
      if (isPickingStart) {
        setTempStart(selectedDate);
        setIsPickingStart(false); // 다음은 종료시간 선택
        // picker 계속 보여주기 위해 setShowPicker(true) 유지
      } else {
        setTempEnd(selectedDate);
        setShowPicker(false);
        setIsPickingStart(true);
        // 선택 완료 후 onChange 호출
        onChange(tempStart, selectedDate);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.inputBox} onPress={() => setShowPicker(true)}>
        <Text style={styles.timeText}>
          {formatTime(time)} ~ {formatTime(time)}
        </Text>
        <Ionicons name="time-outline" size={20} color="#000" />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={isPickingStart ? tempStart : tempEnd}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangePicker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 5 },
  label: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
  timeText: { fontSize: 20 },
});

export default TimeRangePicker;
