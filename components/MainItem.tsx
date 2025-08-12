import AddSchedulePopup from '@/components/AddSchedulePopup';
import { toggleCompleted } from '@/storage/scheduleStorage';
import { DisplayTask } from "@/utils/autoInsertRecommended"; // 📌 추가
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';

const PURPLE = "#7B52AA";

interface Props {
  item: DisplayTask; // item prop으로 변경
  current?: boolean; // 추가된 current prop
  lastItem?: boolean; // 추가된 lastItem prop
  backgroundColor?: string; // 배경색을 선택적으로 받을 수 있도록 수정
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function MainDaily({
  item, 
  lastItem, 
  backgroundColor, 
  }: Props) {
  const [checked, setChecked] = useState(item.isCompleted);
  const [popupVisible, setPopupVisible] = useState(false);
  const [scheduleHeight, setScheduleHeight] = useState(0);

  const handleToggle = async () => {
    const updatedTask = await toggleCompleted("일정", item.id);
    if (updatedTask) {
      setChecked(updatedTask.isCompleted);
    }
  };
  
  const showPopup = () => setPopupVisible(true);

  return (
      <Pressable 
        onPress={handleToggle}
        style={[
          styles.scheduleItem, 
          {backgroundColor: checked
            ? "#CCCCCC" // 완료된 일정
            : backgroundColor // 기본 색
          }, 
          { marginBottom: lastItem ? 30 : 15 }, 
      ]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setScheduleHeight(height); // 일정 박스 높이를 상태로 저장
        }}>
        <View style={styles.iconWrapper}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            color="white"
            uncheckedColor="white"
          />
        </View>
        <Text style={[styles.scheduleText, styles.textDaily]}>
          {item.text}
        </Text>
        <IconButton icon="information-outline" size={16} style={styles.icon} iconColor='white' onPress={showPopup} />
        {popupVisible && (
          console.log(item.date, item.timeStart, item.timeEnd),
          <AddSchedulePopup
            onClose={() => setPopupVisible(false)}
            initialValues={{
              Tab: '일정', 
              title: item.text,
              id: item.id,
              dueDate: item.date ? new Date(item.date as string) : undefined,
              startTime: item.timeStart ? new Date(`${item.date}T${item.timeStart}:00`) : undefined,
              endTime: item.timeEnd ? new Date(`${item.date}T${item.timeEnd}:00`) : undefined,
            }}
          />
        )}
      </Pressable>
    );
  }

export function MainRecommended({
  item, 
  current = false, // 기본값 설정
  }: Props) {
  const [popupVisible, setPopupVisible] = useState(false);
  
  const showPopup = () => setPopupVisible(true);

  return (
    <Pressable 
      style={[
        styles.scheduleItem, styles.RecommendedItem
      ]}
    >
      <View style={styles.iconWrapper}>
        <IconButton
          icon={current ? "lightbulb-on" : "lightbulb-on-outline"}
          size={24}
          style={styles.icon}
          iconColor="#7B52AA"
        />
      </View>
      <Text style={[styles.scheduleText, styles.TextRecommended]}>{item.text}{' '}
        <Text style={styles.miniText}>
          {item.duration + "분"}
        </Text>
      </Text>
      <IconButton icon="information-outline" size={16} style={styles.icon} iconColor="#7B52AA" onPress={showPopup} />
      {popupVisible && (
        <AddSchedulePopup
          onClose={() => setPopupVisible(false)}
          initialValues={{
            Tab: '추천', 
            title: item.text,
            id: item.id,
            duration: item.duration !== undefined ? item.duration.toString() : undefined,
          }}
        />
      )}
    </Pressable>
    );
  }

const styles = StyleSheet.create({
  scheduleItem: { 
    flex: 1,  
    alignItems: "center", 
    flexDirection: "row", 
    minHeight: 30,
    marginVertical: 15, 
    marginHorizontal: 16,
    padding: 18, 
    borderRadius: 12,  
    },
  RecommendedItem: {
    borderWidth: 1, 
    borderColor: PURPLE, 
  }, 
  scheduleText: { 
    fontSize: 16, 
    flex: 1,
    fontWeight: "600", 
   },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    marginRight: 8, // 필요 시 여백 조정
  },
  icon: {
    height: 24,
  },
  miniText: {
    fontSize: 13,
    fontWeight: "500", 
  },
  TextRecommended: { 
    color: PURPLE, 
    },
  textDaily: { 
    color: "white", 
    fontWeight: "bold" 
  }, 
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
  dateText: {
    fontSize: 13,
  },
});
