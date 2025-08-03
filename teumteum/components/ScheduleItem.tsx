import { View, Text, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';
import React, { useState } from 'react';
import { Pressable } from 'react-native'; // 또는 TouchableOpacity
interface Props {
  label: string;
  checked?: boolean;
  color?: string;
  checked_color?: string;
}

export default function ScheduleItem({ label, color = '#000', checked_color = '#591A85' }: Props) {
  const [checked, setChecked] = useState(false);
  
  return (
    <Pressable style={styles.container} onPress={() => setChecked(!checked)}>
      <Checkbox
        status={checked ? 'checked' : 'unchecked'}
        color={checked_color}
      />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    marginLeft: 4,
    marginBottom: 4,
  },
});
