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
import TimePicker from './TimePickercomp';
import { addTask, updateTask, deleteTask } from '../storage/scheduleStorage';
import DebugDB from '@/components/DebugDB';
import emitter from '../storage/EventEmitter';

interface AddSchedulePopupProps {
  onClose: () => void;
  initialValues?: {
    id: string;
    Tab: '장기' | '추천' | '일정';
    title: string;
    dueDate?: Date;
    duration?: string;
    startTime?: Date;
    endTime?: Date;
  };
}

const { height } = Dimensions.get('window');
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const AddSchedulePopup: React.FC<AddSchedulePopupProps> = ({
  onClose, 
  initialValues, 
}) => {
  // 초기값 사용하여 상태 설정
  const [activeTab, setActiveTab] = useState<'장기' | '추천' | '일정'>(initialValues?.Tab ?? '장기');
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [dueDate, setdueDate] = useState(initialValues?.dueDate ?? new Date());
  const [duration, setDuration] = useState(initialValues?.duration ?? '');
  const [StartTime, setStartTime] = useState(initialValues?.startTime ?? new Date());
  const [EndTime, setEndTime] = useState(initialValues?.endTime ?? new Date());

  // 저장 버튼 눌렀을 때 실행할 함수
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    try {
      let param: {
        dueDate?: string;
        duration?: number;
        date?: string;
        startTime?: string;
        endTime?: string;
      };

      if (activeTab === '장기') {
        param = {dueDate: formatDate(dueDate)} // YYYY-MM-DD
      } else if (activeTab === '추천') {
        const durationNumber = parseInt(duration, 10);
        if (isNaN(durationNumber) || durationNumber <= 0) {
          Alert.alert('알림', '소요 시간을 올바르게 입력해주세요.');
          return;
        }
        param = {duration: durationNumber}
      } else {
        // 종료 시간이 시작 시간보다 앞서면 경고
        if (EndTime < StartTime) {
          Alert.alert('알림', '종료 시간이 시작 시간보다 빨라요. 다시 설정해주세요.');
          return;
        }
        const StartString = StartTime.toTimeString().slice(0, 5); // HH:mm
        const EndString = EndTime.toTimeString().slice(0, 5); // HH:mm
        param = {
            date: formatDate(dueDate), // YYYY-MM-DD
            startTime: StartString,
            endTime: EndString,
        }
      }
      
      if (initialValues?.id && initialValues?.Tab) {
        await updateTask(initialValues.id, initialValues.Tab, activeTab,title.trim(), param); 
      } else {
        await addTask(activeTab, title.trim(), param)
      }
      
      emitter.emit('scheduleChanged');
      onClose();  // 팝업 닫기
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    const id = initialValues?.id;
    if (!id) return;

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

              await deleteTask(type, id);

              emitter.emit('scheduleChanged'); 
              onClose(); // 팝업 닫기
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
              <IconButton 
                icon="close" 
                size={24} 
                iconColor="#591A85" 
                onPress={initialValues?.id ? handleDelete : onClose} 
              />
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

            {/* 입력창 */}
            <View style={{paddingHorizontal: 12}}>
              {/* 공통 입력 */}
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
                    date={dueDate}
                    onChange={setdueDate}
                  />
                </View>
              )}

              {activeTab === '추천' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>소요 시간</Text>
                  <View style={styles.rowBox}>
                    <TextInput
                      style={styles.textInput}
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
                      date={dueDate}
                      onChange={setdueDate}
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
  },
  label: {
    marginBottom: 6,
    fontWeight: 'bold',
    fontSize: 20,
    paddingHorizontal: 4,
  },
  textInput: {
    fontSize: 20,
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
  },
  rowBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 20,
    paddingHorizontal: 4,
    paddingTop: 5,
    paddingBottom: 10,
  },
  TimeGroup: {
    flexDirection: 'row',
  },
  TimeText: {
    fontSize: 20,
    paddingHorizontal: 4,
    paddingTop: 45,
    paddingBottom: 10,
  },
});

export default AddSchedulePopup;
