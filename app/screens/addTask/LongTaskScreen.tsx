import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const LongTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const [yearError, setYearError] = useState('');
  const [monthError, setMonthError] = useState('');
  const [dayError, setDayError] = useState('');

  // 유효성 검사 함수
  const validateDate = () => {
    let valid = true;

    if (!/^\d{4}$/.test(year)) {
      setYearError('4자리 숫자로 입력해주세요');
      valid = false;
    } else {
      setYearError('');
    }

    const monthNum = parseInt(month);
    if (!(monthNum >= 1 && monthNum <= 12)) {
      setMonthError('1~12 사이의 숫자를 입력해주세요');
      valid = false;
    } else {
      setMonthError('');
    }

    const dayNum = parseInt(day);
    const maxDay = new Date(parseInt(year), monthNum, 0).getDate(); // 해당 월의 마지막 날짜
    if (!(dayNum >= 1 && dayNum <= maxDay)) {
      setDayError(`1~${maxDay} 사이의 숫자를 입력해주세요`);
      valid = false;
    } else {
      setDayError('');
    }

    return valid;
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

      <Text style={styles.title}>종료 날짜</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="0000"
          maxLength={4}
          keyboardType="numeric"
          value={year}
          onChangeText={(text) => {
            setYear(text);
            setYearError('');
          }}
          onBlur={validateDate}
        />
        <Text>년</Text>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={month}
          onChangeText={(text) => {
            setMonth(text);
            setMonthError('');
          }}
          onBlur={validateDate}
        />
        <Text>월</Text>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={day}
          onChangeText={(text) => {
            setDay(text);
            setDayError('');
          }}
          onBlur={validateDate}
        />
        <Text>일</Text>
      </View>

      {/* 오류 메시지 출력 */}
      {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}
      {monthError ? <Text style={styles.errorText}>{monthError}</Text> : null}
      {dayError ? <Text style={styles.errorText}>{dayError}</Text> : null}
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
  },
});

export default LongTaskScreen;