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
} from 'react-native';
import DatePicker from './DatePickercomp';
import { IconButton } from 'react-native-paper';

interface AddSchedulePopupProps {
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const AddSchedulePopup: React.FC<AddSchedulePopupProps> = ({ onClose }) => {
  const categories = ['장기', '추천', '일정'];
  const [selectedCategory, setSelectedCategory] = useState('장기');
  const [activeTab, setActiveTab] = useState<'장기' | '추천' | '일정'>('장기');
  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState(new Date()); // 종료 날짜 상태

  return (
    <Modal transparent visible animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={styles.popupContainer}
            onStartShouldSetResponder={() => true}  // 팝업 내부는 닫히지 않도록
          >
            {/* 탭 선택 */}
            <View style={styles.header}>
              <IconButton icon="arrow-left" size={22} disabled style={{ opacity: 0 }} />
            <View style={styles.segmentedContainer}>
              {categories.map((category, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.segmentButton,
                    selectedCategory === category && styles.selectedSegment,
                    index === 0 ? styles.leftSegment : index === categories.length - 1 ? styles.rightSegment : null,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedCategory === category && styles.selectedSegmentText,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
            <IconButton icon="close-box" size={22} iconColor="#591A85" onPress={onClose} />
            </View>

            {/* 공통 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>제목</Text>
              <TextInput placeholder="입력하세요" style={styles.textInput} />
            </View>

            {/* 탭 별 입력 */}
            {selectedCategory === '장기' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>종료 날짜</Text>
                <DatePicker date={endDate} onChange={setEndDate}/>
              </View>
            )}

            {selectedCategory === '추천' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>소요 시간</Text>
                <View style={styles.rowBox}>
                  <TextInput style={styles.durationInput} placeholder="00" />
                  <Text>분</Text>
                </View>
              </View>
            )}

            {selectedCategory === '일정' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>날짜</Text>
                  <DatePicker date={endDate} onChange={setEndDate}/>
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
      </TouchableWithoutFeedback>
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
  inputGroup: {
    marginBottom: 20,
    paddingHorizontal: 12,
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
    textAlign: 'center',
  },
  timeInput: {
    width: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 4,
    marginHorizontal: 2,
    textAlign: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#B0A4C0',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderRightColor: '#B0A4C0',
  },
  selectedSegment: {
    backgroundColor: '#E6D9F3',
  },
  segmentText: {
    fontSize: 14,
    color: 'black',
  },
  selectedSegmentText: {
    fontWeight: 'bold',
  },
  leftSegment: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  rightSegment: {
    borderRightWidth: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AddSchedulePopup;
