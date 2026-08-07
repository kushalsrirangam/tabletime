import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius } from '../theme';

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'create'>('signIn');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const disabled = submitting || !email.trim() || !password || (mode === 'create' && (!fullName.trim() || password.length < 8));

  const submit = async () => {
    if (disabled) return;
    setSubmitting(true);
    setError(undefined);
    setNotice(undefined);
    if (mode === 'signIn') {
      setError(await signIn(email, password));
    } else {
      const result = await signUp(email, password, fullName);
      setError(result.error);
      if (result.emailConfirmationRequired) setNotice('Check your email to confirm the account, then return here to sign in.');
    }
    setSubmitting(false);
  };

  const changeMode = (nextMode: 'signIn' | 'create') => {
    setMode(nextMode);
    setError(undefined);
    setNotice(undefined);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.brandPanel}>
        <View style={styles.brandLockup}><View style={styles.logo}><Ionicons name="restaurant" size={21} color={colors.surface} /></View><Text style={styles.brand}>TableTime</Text></View>
        <View style={styles.promise}>
          <Text style={styles.eyebrow}>RESTAURANT OPERATIONS</Text>
          <Text style={styles.promiseTitle}>Your team, schedule, and time clock—together.</Text>
          <Text style={styles.promiseCopy}>Built for the pace of hospitality, from first prep to last call.</Text>
        </View>
        <View style={styles.security}><Ionicons name="shield-checkmark" size={18} color="#BBD6C8" /><Text style={styles.securityText}>Secure restaurant access</Text></View>
      </View>
      <View style={styles.formPanel}>
        <View style={styles.form}>
          <View style={styles.modeSwitch}>
            <Pressable onPress={() => changeMode('signIn')} style={[styles.modeOption, mode === 'signIn' && styles.modeOptionActive]}><Text style={[styles.modeText, mode === 'signIn' && styles.modeTextActive]}>Sign in</Text></Pressable>
            <Pressable onPress={() => changeMode('create')} style={[styles.modeOption, mode === 'create' && styles.modeOptionActive]}><Text style={[styles.modeText, mode === 'create' && styles.modeTextActive]}>Create restaurant</Text></Pressable>
          </View>
          <Text style={styles.title}>{mode === 'signIn' ? 'Welcome back' : 'Create your owner account'}</Text><Text style={styles.subtitle}>{mode === 'signIn' ? 'Sign in with the account your manager invited.' : 'Start with your account, then set up your restaurant and first location.'}</Text>
          {mode === 'create' ? <View style={styles.field}><Text style={styles.label}>Your full name</Text><TextInput accessibilityLabel="Your full name" autoCapitalize="words" autoComplete="name" value={fullName} onChangeText={setFullName} placeholder="Jordan Lee" placeholderTextColor="#929B96" style={styles.input} /></View> : null}
          <View style={styles.field}><Text style={styles.label}>Work email</Text><TextInput accessibilityLabel="Work email" autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} placeholder="you@restaurant.com" placeholderTextColor="#929B96" style={styles.input} /></View>
          <View style={styles.field}><Text style={styles.label}>Password</Text><TextInput accessibilityLabel="Password" autoCapitalize="none" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} secureTextEntry value={password} onChangeText={setPassword} placeholder={mode === 'create' ? 'At least 8 characters' : 'Enter your password'} placeholderTextColor="#929B96" style={styles.input} /></View>
          {error ? <View style={styles.error}><Ionicons name="alert-circle" size={16} color={colors.red} /><Text style={styles.errorText}>{error}</Text></View> : null}
          {notice ? <View style={styles.notice}><Ionicons name="mail" size={16} color={colors.forest} /><Text style={styles.noticeText}>{notice}</Text></View> : null}
          <Pressable accessibilityRole="button" onPress={submit} disabled={disabled} style={({ pressed }) => [styles.submit, disabled && styles.submitDisabled, pressed && styles.pressed]}>
            {submitting ? <ActivityIndicator color={colors.surface} /> : <><Text style={styles.submitText}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text><Ionicons name="arrow-forward" size={18} color={colors.surface} /></>}
          </Pressable>
          <Text style={styles.help}>{mode === 'signIn' ? 'Need employee access? Ask your restaurant manager to invite you.' : 'Already have an account? Choose Sign in above.'}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column', backgroundColor: colors.surface },
  brandPanel: { flex: 1, minHeight: 260, backgroundColor: colors.ink, padding: 34, justifyContent: 'space-between' }, brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 11 }, logo: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }, brand: { color: colors.surface, fontSize: 23, fontWeight: '800', letterSpacing: -0.6 },
  promise: { maxWidth: 520 }, eyebrow: { color: colors.orange, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, promiseTitle: { color: colors.surface, fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -1.5, marginTop: 16 }, promiseCopy: { color: '#AAB6B0', fontSize: 15, lineHeight: 23, marginTop: 15, maxWidth: 430 },
  security: { flexDirection: 'row', alignItems: 'center', gap: 8 }, securityText: { color: '#BBD6C8', fontSize: 12, fontWeight: '700' },
  formPanel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 }, form: { width: '100%', maxWidth: 420 }, modeSwitch: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft, marginBottom: 24 }, modeOption: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill }, modeOptionActive: { backgroundColor: colors.surface }, modeText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, modeTextActive: { color: colors.ink }, title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 29 },
  field: { gap: 8, marginBottom: 17 }, label: { color: colors.ink, fontSize: 12, fontWeight: '800' }, input: { height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.canvas, paddingHorizontal: 14, color: colors.ink, fontSize: 14 },
  error: { flexDirection: 'row', gap: 7, backgroundColor: colors.redSoft, borderRadius: 10, padding: 11, marginBottom: 14 }, errorText: { flex: 1, color: colors.red, fontSize: 12, lineHeight: 17 }, notice: { flexDirection: 'row', gap: 7, backgroundColor: colors.mint, borderRadius: 10, padding: 11, marginBottom: 14 }, noticeText: { flex: 1, color: colors.forest, fontSize: 12, lineHeight: 17 },
  submit: { height: 50, borderRadius: 12, backgroundColor: colors.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, submitDisabled: { opacity: 0.45 }, submitText: { color: colors.surface, fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.78 }, help: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 18 },
});
