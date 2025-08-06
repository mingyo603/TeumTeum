import React from 'react';
import { Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { DailySchedule } from '../storage/scheduleStorage';

// 한글 로케일 설정
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

interface MyCalendarProps {
  selectedDate: string;
  setSelectedDate: (dateString: string) => void;
  dailySchedules: DailySchedule[];
  setCalendarVisibility: (visible: boolean) => void;
  dotType?: 'completed' | 'incomplete';
}

export default function MyCalendar({
  selectedDate,
  setSelectedDate,
  dailySchedules,
  setCalendarVisibility,
  dotType = 'incomplete',
}: MyCalendarProps) {

  const markedDates = Object.fromEntries(
    dailySchedules
      .filter(task => {
        if (dotType === 'completed') return task.isCompleted;
        return !task.isCompleted;
      })
      .map(task => {
        const date = task.date.slice(0, 10);
        const isSelected = date === selectedDate;

        return [
          date,
          {
            marked: true,
            dotColor: isSelected ? '#ffffff' : dotType === 'completed' ? '#aaa' : '#591A85',
            selected: isSelected,
            selectedColor: isSelected ? '#591A85' : undefined,
          },
        ];
      })
  );

  // 선택된 날짜인데 dot이 없는 경우에도 표시
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: '#591A85',
      marked: false,              // ⬅ 추가
      dotColor: '#ffffff',        // ⬅ 추가 (선택된 날짜일 때의 기본 dot 색상)
    };
  }

  const renderCustomHeader = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return (
      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#591A85',
          textAlign: 'center',
          paddingVertical: 10,
        }}
      >
        {year}년 {month}월
      </Text>
    );
  };

  return (
    <Calendar
      onDayPress={(day) => {
        setSelectedDate(day.dateString);
        setCalendarVisibility(false);
      }}
      markedDates={markedDates}
      theme={{
        selectedDayBackgroundColor: '#591A85',
        todayTextColor: '#591A85',
        arrowColor: '#591A85',
      }}
      firstDay={0}
      renderHeader={renderCustomHeader}
    />
  );
}
