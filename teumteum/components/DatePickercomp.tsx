// components/date/DatePicker.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  date?: Date;           // 옵셔널로 변경
  onChange: (newDate: Date) => void;
  defaultDate?: Date;    // 초기값용 props 추가
}

const DatePicker: React.FC<Props> = ({ date, onChange, defaultDate }) => {
  const [currentDate, setCurrentDate] = useState<Date>(date ?? defaultDate ?? new Date());
  const [showPicker, setShowPicker] = useState(false);

  // date props가 바뀌면 currentDate도 업데이트
  React.useEffect(() => {
    if (date) setCurrentDate(date);
  }, [date]);

  const formattedDate = `${currentDate.getFullYear()}년 ${String(currentDate.getMonth() + 1).padStart(2, '0')}월 ${String(currentDate.getDate()).padStart(2, '0')}일`;

  const handleChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setCurrentDate(selectedDate);
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.inputBox} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Ionicons name="calendar-outline" size={20} color="#000" />
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { marginBottom: 1 },
  label: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 6,
    padding: 10,
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 20, },
});

export default DatePicker;
