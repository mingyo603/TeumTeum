// AddSchedulePopup.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import DatePicker from './DatePickercomp';
import { IconButton } from 'react-native-paper';
import TimePicker from './TimePickercomp';  // TimePicker 컴포넌트 임포트
import { addLongTermTask, addRecommendedTask, addDailySchedule } from '../storage/scheduleStorage';
import DebugDB from '@/components/DebugDB';  // 경로는 실제 위치에 맞게

interface AddSchedulePopupProps {
  onClose: () => void;
  date?: Date; // 없어도 무방해서 optional 처리
}

const { width, height } = Dimensions.get('window');

const AddSchedulePopup: React.FC<AddSchedulePopupProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'장기' | '추천' | '일정'>('장기');
  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState(new Date()); // 종료 날짜 상태

  // ‘추천’ 탭용 소요 시간 상태 추가
  const [duration, setDuration] = useState('');

  // ‘일정’ 탭용 시작시간, 종료시간 상태 추가
  const [StartTime, setStartTime] = useState(new Date());
  const [EndTime, setEndTime] = useState(new Date());

  // 저장 버튼 눌렀을 때 실행할 함수
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    try {
      if (activeTab === '장기') {
        await addLongTermTask(title.trim(), endDate);
      } else if (activeTab === '추천') {
        const durationNumber = parseInt(duration, 10);
        if (isNaN(durationNumber) || durationNumber <= 0) {
          Alert.alert('알림', '소요 시간을 올바르게 입력해주세요.');
          return;
        }
        await addRecommendedTask(title.trim(), durationNumber);
      } else if (activeTab === '일정') {
        // 종료 시간이 시작 시간보다 앞서면 경고
        if (EndTime < StartTime) {
          Alert.alert('알림', '종료 시간이 시작 시간보다 빨라요. 다시 설정해주세요.');
          return;
        }
        const StartString = StartTime.toTimeString().slice(0, 5); // HH:mm
        const EndString = EndTime.toTimeString().slice(0, 5); // HH:mm
        await addDailySchedule(
          title.trim(),
          endDate,
          StartString,   // 예: "12:00"
          EndString,      // 예: "13:00"
        );
      }

      onClose();  // 저장 후 팝업 닫기
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal transparent visible animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={styles.popupContainer}
            onStartShouldSetResponder={() => true}  // 팝업 내부는 닫히지 않도록
          >
            {/* 탭 선택 */}
            <View style={styles.tabRow}>
              <IconButton icon="close" size={24} iconColor="#591A85" onPress={onClose} />
              <View style={styles.tabGroup}>
                {['장기', '추천', '일정'].map((tab, idx) => (
                  <Pressable
                    key={tab}
                    style={[
                      styles.tabButton,
                      activeTab === tab && styles.activeTab,
                      idx === 0 && styles.leftTab,
                      idx === 2 && styles.rightTab,
                    ]}
                    onPress={() => setActiveTab(tab as typeof activeTab)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <IconButton icon="check" size={24} iconColor="#591A85" onPress={handleSave} />
            </View>

            {/* 공통 입력 */}
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>제목</Text>
                <TextInput
                  placeholder="입력하세요"
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* 탭 별 입력 */}
              {activeTab === '장기' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>날짜</Text>
                  <DatePicker date={endDate} onChange={setEndDate} />
                </View>
              )}

              {activeTab === '추천' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>소요 시간</Text>
                  <View style={styles.rowBox}>
                    <TextInput
                      style={styles.durationInput}
                      placeholder="00"
                      keyboardType="number-pad"
                      value={duration}
                      onChangeText={setDuration}
                    />
                    <Text style={styles.durationText}>분</Text>
                  </View>
                </View>
              )}

              {activeTab === '일정' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>날짜</Text>
                    <DatePicker date={endDate} onChange={setEndDate} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>시간</Text>
                    <View style={styles.TimeGroup}>
                      <TimePicker time={StartTime} onChange={setStartTime} />
                      <Text style={styles.TimeText}> ~ </Text>
                      <TimePicker time={EndTime} onChange={setEndTime} />
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <DebugDB />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  popupContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
    minHeight: height * 0.55,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#f0e9fa',
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#7B52AA',
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  leftTab: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderLeftWidth: 1,
  },
  rightTab: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  activeTab: {
    backgroundColor: '#7B52AA',
  },
  tabText: {
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  label: {
    marginBottom: 6,
    fontWeight: 'bold',
    fontSize: 20,
    paddingHorizontal: 4,
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    fontSize: 20,
  },
  rowBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    fontSize: 20,
  },
  durationText: {
    fontSize: 20,
    paddingHorizontal: 4,
    padding: 10,
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  TimeGroup: {
    flexDirection: 'row',
  },
  TimePicker: {},
  TimeText: {
    fontSize: 20,
    paddingHorizontal: 4,
    padding: 10,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
});

export default AddSchedulePopup;
