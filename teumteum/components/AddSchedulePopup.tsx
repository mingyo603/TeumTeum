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

interface AddSchedulePopupProps {
  onClose: () => void;
  date: Date;
}

const { width, height } = Dimensions.get('window');

const AddSchedulePopup: React.FC<AddSchedulePopupProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'장기' | '추천' | '일정'>('장기');
  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState(new Date()); // 종료 날짜 상태

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* 탭 선택 */}
          <View style={styles.tabRow}>
            {['장기', '추천', '일정'].map((tab) => (
              <Pressable
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab as typeof activeTab)}>
                <Text style={styles.tabText}>{tab}</Text>
              </Pressable>
            ))}
            <Pressable onPress={onClose}>
                <Text style={styles.closeButton}>❌</Text>
            </Pressable>
          </View>

          {/* 공통 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>제목</Text>
            <TextInput placeholder="입력하세요" style={styles.textInput} />
          </View>

          {/* 탭 별 입력 */}
          {activeTab === '장기' && (
            <View style={styles.inputGroup}>
                <DatePicker label="종료 날짜" date={endDate} onChange={setEndDate}/>
            </View>
          )}

          {activeTab === '추천' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>소요 시간</Text>
              <View style={styles.rowBox}>
                <TextInput style={styles.durationInput} placeholder="00" />
                <Text>분</Text>
              </View>
            </View>
          )}

          {activeTab === '일정' && (
            <>
              <View style={styles.inputGroup}>
                <DatePicker label="종료 날짜" date={endDate} onChange={setEndDate}/>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>시간</Text>
                <View style={styles.rowBox}>
                  <TextInput style={styles.timeInput} placeholder="00" />
                  <Text>:</Text>
                  <TextInput style={styles.timeInput} placeholder="00" />
                  <Text> ~ </Text>
                  <TextInput style={styles.timeInput} placeholder="00" />
                  <Text>:</Text>
                  <TextInput style={styles.timeInput} placeholder="00" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#7B52AA',
  },
  tabText: {
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  timeInput: {
    width: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});

export default AddSchedulePopup;
