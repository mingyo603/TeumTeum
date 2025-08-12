import React, { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onChange: (newDate: Date) => void;
  date?: Date;
}

const DatePicker: React.FC<Props> = ({ date, onChange }) => {
  const [currentDate, setCurrentDate] = useState<Date>(date ?? new Date());
  const [showPicker, setShowPicker] = useState(false);

  const formattedDate = `${currentDate.getFullYear()}년 ${String(currentDate.getMonth() + 1).padStart(2, '0')}월 ${String(currentDate.getDate()).padStart(2, '0')}일`;

  const handleChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setCurrentDate(selectedDate);
      onChange(selectedDate);
    }
  };

  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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