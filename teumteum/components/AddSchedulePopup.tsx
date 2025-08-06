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
import { 
  addLongTermTask, 
  addRecommendedTask, 
  addDailySchedule, 
  updateLongTermTask, 
  updateRecommendedTask, 
  updateDailySchedule, 
  deleteTaskByType, 
} from '../storage/scheduleStorage';
import DebugDB from '@/components/DebugDB';  // 경로는 실제 위치에 맞게

interface AddSchedulePopupProps {
  onClose: () => void;
  onSave: () => void;
  date?: string; // 기존 유지
  initialTab?: '장기' | '추천' | '일정'; // ✅ 추가: 초기 탭
  initialValues?: {
    id?: string; // ✅ 추가
    title?: string;
    endDate?: Date;
    duration?: string;
    startTime?: Date;
    endTime?: Date;
    dueDate?: Date;
  }; // ✅ 추가: 초기값
}

const { width, height } = Dimensions.get('window');

const AddSchedulePopup: React.FC<AddSchedulePopupProps> = ({
  onClose, onSave, 
  initialTab = '장기', // ✅ 기본값 지정
  initialValues = {},   // ✅ 기본값 지정
}) => {
  // ✅ 초기값 사용하여 상태 설정
  const [activeTab, setActiveTab] = useState<'장기' | '추천' | '일정'>(initialTab);
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [endDate, setEndDate] = useState(initialValues.endDate ?? new Date());
  const [duration, setDuration] = useState(initialValues.duration ?? '');
  const [StartTime, setStartTime] = useState(initialValues.startTime ?? new Date());
  const [EndTime, setEndTime] = useState(initialValues.endTime ?? new Date());

  // 저장 버튼 눌렀을 때 실행할 함수
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    try {
      if (activeTab === '장기') {
        if (initialValues.id) {
          // ✅ 수정 모드
          await updateLongTermTask(initialValues.id, title.trim(), endDate.toISOString().split('T')[0]);
        } else {
          // ✅ 추가 모드
          await addLongTermTask(title.trim(), endDate.toISOString().split('T')[0]); // "YYYY-MM-DD" 형식
        }
      } else if (activeTab === '추천') {
        const durationNumber = parseInt(duration, 10);
        if (isNaN(durationNumber) || durationNumber <= 0) {
          Alert.alert('알림', '소요 시간을 올바르게 입력해주세요.');
          return;
        }
        if (initialValues.id) {
          // ✅ 수정 모드
          await updateRecommendedTask(initialValues.id, title.trim(), durationNumber);
        } else {
          // ✅ 추가 모드
          await addRecommendedTask(title.trim(), durationNumber);
        }
      } else if (activeTab === '일정') {
        // 종료 시간이 시작 시간보다 앞서면 경고
        if (EndTime < StartTime) {
          Alert.alert('알림', '종료 시간이 시작 시간보다 빨라요. 다시 설정해주세요.');
          return;
        }
        const StartString = StartTime.toTimeString().slice(0, 5); // HH:mm
        const EndString = EndTime.toTimeString().slice(0, 5); // HH:mm
        if (initialValues.id) {
          // ✅ 수정 모드
          await updateDailySchedule(
            initialValues.id, 
            title.trim(),
            endDate.toISOString().split('T')[0], // "YYYY-MM-DD" 형식
            StartString,   // 예: "12:00"
            EndString,      // 예: "13:00"
          );
        } else {
          // ✅ 추가 모드
          await addDailySchedule(
            title.trim(),
            endDate.toISOString().split('T')[0], // "YYYY-MM-DD" 형식
            StartString,   // 예: "12:00"
            EndString,      // 예: "13:00"
          );
        }
      }

      onClose();  // 저장 후 팝업 닫기
      await onSave();  // 부모 컴포넌트에 새로고침 요청 (await 붙여서 완료를 기다릴 수도 있음)
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!initialValues.id) return;

    Alert.alert(
      '삭제 확인',
      '정말 삭제하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // activeTab 값에 따라 타입 구분 ('장기' | '추천' | '일정')
              let type: '장기' | '추천' | '일정' = activeTab;

              // storage 함수 import 가정: deleteTaskByType(type, id)
              await deleteTaskByType(type, initialValues.id);

              onClose(); // 삭제 후 팝업 닫기
            } catch (error) {
              console.error(error);
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
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
              {initialValues.id ? (
                <IconButton icon="close" size={24} iconColor="#591A85" onPress={handleDelete} />
              ) : (
                <IconButton icon="close" size={24} iconColor="#591A85" onPress={onClose} />
              )}
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
                  <Text style={styles.label}>종료 날짜</Text>
                  <DatePicker
                    date={endDate}
                    onChange={setEndDate}
                  />
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
                    <DatePicker
                      date={endDate}
                      onChange={setEndDate}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <View style={styles.TimeGroup}>
                      <View>
                        <Text style={styles.label}>시작 시간</Text>
                        <TimePicker time={StartTime} onChange={setStartTime} />
                      </View>
                      <Text style={styles.TimeText}> ~ </Text>
                      <View>
                        <Text style={styles.label}>종료 시간</Text>
                        <TimePicker time={EndTime} onChange={setEndTime} />
                      </View>
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
    paddingTop: 45,
  },
});

export default AddSchedulePopup;
