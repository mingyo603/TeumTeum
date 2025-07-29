import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const LongTaskScreen = () => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');

  const [yearError, setYearError] = useState('');
  const [monthError, setMonthError] = useState('');
  const [dayError, setDayError] = useState('');
  const [startHourError, setStartHourError] = useState('');
  const [startMinuteError, setStartMinuteError] = useState('');
  const [endHourError, setEndHourError] = useState('');
  const [endMinuteError, setEndMinuteError] = useState('');

  const validateYear = (text: string) => {
    setYear(text);
    if (text === '') {
      setYearError('');
    } else if (!/^\d{4}$/.test(text)) {
      setYearError('년도를 4자리 숫자로 입력하세요.');
    } else {
      setYearError('');
    }
  };

  const validateMonth = (text: string) => {
    setMonth(text);
    const num = Number(text);
    if (text === '') {
      setMonthError('');
    } else if (!/^\d{1,2}$/.test(text) || num < 1 || num > 12) {
      setMonthError('1~12 사이의 숫자를 입력해주세요');
    } else {
      setMonthError('');
    }
  };

  const validateDay = (text: string) => {
    setDay(text);
    const num = Number(text);
    if (text === '') {
      setDayError('');
    } else if (!/^\d{1,2}$/.test(text) || num < 1 || num > 31) {
      setDayError('1~${maxDay} 사이의 숫자를 입력해주세요');
    } else {
      setDayError('');
    }
  };

  const validateHour = (text: string, setValue: React.Dispatch<React.SetStateAction<string>>, setError: React.Dispatch<React.SetStateAction<string>>, label: string) => {
    setValue(text);
    const num = Number(text);
    if (text === '') {
      setError('');
    } else if (!/^\d{1,2}$/.test(text) || num < 0 || num > 23) {
      setError(`${label}는 0~23 사이의 숫자를 입력하세요.`);
    } else {
      setError('');
    }
  };

  const validateMinute = (text: string, setValue: React.Dispatch<React.SetStateAction<string>>, setError: React.Dispatch<React.SetStateAction<string>>, label: string) => {
    setValue(text);
    const num = Number(text);
    if (text === '') {
      setError('');
    } else if (!/^\d{1,2}$/.test(text) || num < 0 || num > 59) {
      setError(`${label}는 0부터 59 사이를 입력하세요.`);
    } else {
      setError('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>제목</Text>
      <TextInput style={styles.input} placeholder="입력하세요" />

      <Text style={styles.title}>날짜</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="0000"
          maxLength={4}
          keyboardType="numeric"
          value={year}
          onChangeText={validateYear}
        />
        <Text>년</Text>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={month}
          onChangeText={validateMonth}
        />
        <Text>월</Text>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={day}
          onChangeText={validateDay}
        />
        <Text>일</Text>
      </View>
      {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}
      {monthError ? <Text style={styles.errorText}>{monthError}</Text> : null}
      {dayError ? <Text style={styles.errorText}>{dayError}</Text> : null}

      <Text style={styles.title}>시작 시간</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={startHour}
          onChangeText={text => validateHour(text, setStartHour, setStartHourError, '시작 시간')}
        />
        <Text>:</Text>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={startMinute}
          onChangeText={text => validateMinute(text, setStartMinute, setStartMinuteError, '시작 분')}
        />
      </View>
      {startHourError ? <Text style={styles.errorText}>{startHourError}</Text> : null}
      {startMinuteError ? <Text style={styles.errorText}>{startMinuteError}</Text> : null}

      <Text style={styles.title}>종료 시간</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={endHour}
          onChangeText={text => validateHour(text, setEndHour, setEndHourError, '종료 시간')}
        />
        <Text>:</Text>
        <TextInput
          style={styles.dateInput2}
          placeholder="00"
          maxLength={2}
          keyboardType="numeric"
          value={endMinute}
          onChangeText={text => validateMinute(text, setEndMinute, setEndMinuteError, '종료 분')}
        />
      </View>
      {endHourError ? <Text style={styles.errorText}>{endHourError}</Text> : null}
      {endMinuteError ? <Text style={styles.errorText}>{endMinuteError}</Text> : null}
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