import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <View style={styles.pageTitle}>
      <View style={styles.pageCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {action}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onPress}><Text style={styles.link}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Button({ label, icon, onPress, variant = 'primary', compact = false, disabled = false, loading = false }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress?: () => void; variant?: 'primary' | 'secondary' | 'danger'; compact?: boolean; disabled?: boolean; loading?: boolean }) {
  const iconColor = variant === 'secondary' ? colors.ink : colors.surface;
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, styles[`${variant}Button`], compact && styles.compactButton, (disabled || loading) && styles.buttonDisabled, pressed && styles.buttonPressed]}>
      {loading ? <ActivityIndicator size="small" color={iconColor} /> : icon ? <Ionicons name={icon} size={compact ? 15 : 18} color={iconColor} /> : null}
      <Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ initials, color, size = 42 }: { initials: string; color: string; size?: number }) {
  return <View style={[styles.personAvatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}20` }]}><Text style={[styles.personInitials, { color, fontSize: size * 0.3 }]}>{initials}</Text></View>;
}

export function StatusPill({ label, tone = 'green' }: { label: string; tone?: 'green' | 'orange' | 'red' | 'gray' | 'blue' }) {
  const tones = {
    green: [colors.mint, colors.forest], orange: [colors.orangeSoft, '#A45120'], red: [colors.redSoft, colors.red],
    gray: [colors.surfaceSoft, colors.muted], blue: [colors.blueSoft, colors.blue],
  };
  return <View style={[styles.pill, { backgroundColor: tones[tone][0] }]}><Text style={[styles.pillText, { color: tones[tone][1] }]}>{label}</Text></View>;
}

export const sharedStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border },
});

const styles = StyleSheet.create({
  pageTitle: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, marginBottom: 26 }, pageCopy: { flex: 1 },
  eyebrow: { color: colors.orange, fontWeight: '800', fontSize: 11, letterSpacing: 1.2, marginBottom: 7 },
  title: { color: colors.ink, fontSize: 29, lineHeight: 34, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 7, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' }, link: { color: colors.forest, fontSize: 13, fontWeight: '700' },
  button: { minHeight: 46, paddingHorizontal: 18, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { backgroundColor: colors.forest }, secondaryButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, dangerButton: { backgroundColor: colors.red },
  compactButton: { minHeight: 36, paddingHorizontal: 13, borderRadius: 9 }, buttonDisabled: { opacity: 0.56 }, buttonPressed: { opacity: 0.78 },
  buttonText: { color: colors.surface, fontSize: 13, fontWeight: '800' }, secondaryButtonText: { color: colors.ink },
  personAvatar: { alignItems: 'center', justifyContent: 'center' }, personInitials: { fontWeight: '800' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill }, pillText: { fontSize: 10, fontWeight: '800' },
});
