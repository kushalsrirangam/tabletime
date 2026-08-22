import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius } from '../theme';

export function PasswordRecoveryScreen() {
  const { session, recoveryError, completePasswordRecovery, cancelPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const passwordsMatch = password === confirmation;
  const canSubmit = Boolean(session) && password.length >= 8 && passwordsMatch && !submitting;
  const linkError = recoveryError ?? (!session ? 'The password-reset session could not be opened. Request a new reset email.' : undefined);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(undefined);
    const result = await completePasswordRecovery(password);
    if (result) setError(result);
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.icon}><Ionicons name="key-outline" size={27} color={colors.surface} /></View>
        <Text style={styles.eyebrow}>SECURE ACCOUNT RECOVERY</Text>
        <Text style={styles.title}>{linkError ? 'Reset link needs attention' : 'Choose a new password'}</Text>
        <Text style={styles.subtitle}>{linkError ? 'This link cannot finish password recovery.' : `Update the password for ${session?.user.email ?? 'your TableTime account'}.`}</Text>

        {linkError ? (
          <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle" size={18} color={colors.red} /><Text style={styles.errorText}>{linkError}</Text></View>
        ) : (
          <>
            <View style={styles.field}><Text style={styles.label}>New password</Text><TextInput accessibilityLabel="New password" autoCapitalize="none" autoComplete="new-password" secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor="#929B96" style={styles.input} /></View>
            <View style={styles.field}><Text style={styles.label}>Confirm password</Text><TextInput accessibilityLabel="Confirm new password" autoCapitalize="none" autoComplete="new-password" secureTextEntry value={confirmation} onChangeText={setConfirmation} placeholder="Enter it again" placeholderTextColor="#929B96" style={styles.input} /></View>
            {confirmation && !passwordsMatch ? <Text accessibilityRole="alert" style={styles.validation}>Passwords do not match.</Text> : null}
            {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle" size={18} color={colors.red} /><Text style={styles.errorText}>{error}</Text></View> : null}
            <Pressable accessibilityRole="button" onPress={() => { void submit(); }} disabled={!canSubmit} style={({ pressed }) => [styles.submit, !canSubmit && styles.disabled, pressed && styles.pressed]}>
              {submitting ? <ActivityIndicator color={colors.surface} /> : <><Text style={styles.submitText}>Update password</Text><Ionicons name="checkmark" size={18} color={colors.surface} /></>}
            </Pressable>
          </>
        )}

        <Pressable accessibilityRole="button" onPress={() => { void cancelPasswordRecovery(); }} disabled={submitting} style={styles.cancel}><Text style={styles.cancelText}>Cancel and return to sign in</Text></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', padding: 22 },
  card: { width: '100%', maxWidth: 470, padding: 30, borderRadius: radius.lg, backgroundColor: colors.surface },
  icon: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  eyebrow: { color: colors.orange, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.8, marginTop: 9 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 25 },
  field: { gap: 8, marginBottom: 16 }, label: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  input: { height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.canvas, paddingHorizontal: 14, color: colors.ink, fontSize: 14 },
  validation: { color: colors.red, fontSize: 11, fontWeight: '700', marginTop: -7, marginBottom: 13 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.redSoft, borderRadius: 10, padding: 12, marginBottom: 16 }, errorText: { flex: 1, color: colors.red, fontSize: 12, lineHeight: 17 },
  submit: { height: 50, borderRadius: 12, backgroundColor: colors.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 3 }, submitText: { color: colors.surface, fontSize: 14, fontWeight: '800' },
  cancel: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 9 }, cancelText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  disabled: { opacity: 0.45 }, pressed: { opacity: 0.78 },
});
