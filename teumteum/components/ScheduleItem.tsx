import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';

interface Props {
  label: string;
  checked?: boolean;
  color?: string;
  checked_color?: string;
}

export default function ScheduleItem({ label, checked = false, color = '#000', checked_color = '#591A85' }: Props) {
  return (
    <View style={styles.container}>
      <Checkbox status={checked ? 'checked' : 'unchecked'} color={checked_color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
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
  },
});
