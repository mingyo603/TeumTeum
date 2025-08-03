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
} from 'react-native';
import DatePicker from './DatePickercomp';
import TimePicker from './TimePickercomp';  // TimePicker 컴포넌트 임포트

interface AddSchedulePopupProps {
  onClose: () => void;
  date?: Date; // 없어도 무방해서 optional 처리
}

const { width, height } = Dimensions.get('window');

const AddSchedulePopup: React.FC<AddSchedulePopupProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'장기' | '추천' | '일정'>('장기');
  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState(new Date()); // 종료 날짜 상태

  // ‘일정’ 탭용 시작시간, 종료시간 상태 추가
  const [Time, setTime] = useState(new Date());

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* 탭 선택 */}
          <View style={styles.tabRow}>
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
            <Pressable onPress={onClose} style={styles.closeButtonContainer}>
              <Text style={styles.closeButton}>❌</Text>
            </Pressable>
          </View>

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
              <DatePicker label="종료 날짜" date={endDate} onChange={setEndDate} />
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
                />
                <Text>분</Text>
              </View>
            </View>
          )}

          {activeTab === '일정' && (
            <>
              <View style={styles.inputGroup}>
                <DatePicker label="날짜" date={endDate} onChange={setEndDate} />
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <TimePicker label="시간" time={Time} onChange={setTime} />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
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
    color: '#000',
    fontWeight: 'bold',
  },

  activeTabText: {
    color: '#fff',
  },

  closeButtonContainer: {
    marginLeft: 12,
  },

  closeButton: {
    fontSize: 24,
    color: '#7B52AA',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: 'bold',
    fontSize: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    fontSize: 20,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EADDFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    fontSize: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // 간격 (React Native 0.70 이상에서 지원, 아니면 margin 사용)
  },
  timeItem: {
    flex: 1, // 두 아이템이 균등하게 공간 차지
    marginRight: 6, // 오른쪽 마진 (마지막 아이템 제외할 수도 있음)
  },
});

export default AddSchedulePopup;
