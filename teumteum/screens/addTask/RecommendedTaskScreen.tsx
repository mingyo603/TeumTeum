import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const LongTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [durationError, setDurationError] = useState('');

  const validateDuration = (text: string) => {
    setDuration(text);
    if (text === '') {
      setDurationError('');
    } else if (!/^\d+$/.test(text)) {
      setDurationError('숫자만 입력하세요.');
    } else {
      setDurationError('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>제목</Text>
      <TextInput
        style={styles.input}
        placeholder="입력하세요"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.title}>소요 시간</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          keyboardType="numeric"
          value={duration}
          onChangeText={validateDuration}
          // maxLength 제거하거나 큰 값으로 변경 가능
        />
        <Text>분</Text>
      </View>

      {durationError !== '' && (
        <Text style={styles.errorText}>{durationError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  input: {
    width: 180,
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
    fontSize: 20,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateInput: {
    width: 70,
    borderWidth: 2,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 20,
  },
  dateInput2: {
    width: 50,
    borderWidth: 2,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default LongTaskScreen;