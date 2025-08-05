import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Props {
  time: Date;
  onChange: (newTime: Date) => void;
}

const TimePicker: React.FC<Props> = ({ time, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')} : ${String(date.getMinutes()).padStart(2, '0')}`;

  const onChangePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      setShowPicker(false);
      onChange(selectedDate); // ✅ 부모로 전달
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.inputBox} onPress={() => setShowPicker(true)}>
        <Text style={styles.timeText}>{formatTime(time)}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangePicker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 5 },
  inputBox: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
  timeText: { fontSize: 20 },
});

export default TimePicker;
