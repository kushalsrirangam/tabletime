import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '../theme';
import { Button } from './UI';

type FormModalProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  submitLabel: string;
  canSubmit?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
};

export function FormModal({ visible, title, subtitle, submitLabel, canSubmit = true, submitting = false, onClose, onSubmit, children }: FormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close form" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerCopy}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close}><Ionicons name="close" size={20} color={colors.ink} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">{children}</ScrollView>
          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" disabled={submitting} onPress={onClose} />
            <Button label={submitLabel} icon="checkmark" loading={submitting} disabled={!canSubmit || submitting} onPress={onSubmit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function FormField({ label, value, placeholder, onChangeText, multiline = false, keyboardType = 'default', autoCapitalize }: { label: string; value: string; placeholder: string; onChangeText: (value: string) => void; multiline?: boolean; keyboardType?: TextInputProps['keyboardType']; autoCapitalize?: TextInputProps['autoCapitalize'] }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#929B96"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

export function ChoiceField({ label, options, value, onChange }: { label: string; options: Array<{ label: string; value: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => (
          <Pressable key={option.value} accessibilityRole="button" onPress={() => onChange(option.value)} style={[styles.choice, value === option.value && styles.choiceActive]}>
            <Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(12, 20, 17, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  panel: { width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  header: { padding: 22, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'flex-start', gap: 14 }, headerCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.5 }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  close: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 22, gap: 18 }, footer: { padding: 18, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'flex-end', gap: 9 },
  field: { gap: 8 }, label: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  input: { minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.canvas, paddingHorizontal: 13, color: colors.ink, fontSize: 13 }, textarea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, choice: { minHeight: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, choiceActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  choiceText: { color: colors.muted, fontSize: 11, fontWeight: '700' }, choiceTextActive: { color: colors.surface },
});
