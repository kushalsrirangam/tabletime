import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, radius } from '../theme';

export function OnboardingScreen() {
  const { session, refreshMembership, signOut } = useAuth();
  const metadataName = session?.user.user_metadata.full_name;
  const [restaurantName, setRestaurantName] = useState('');
  const [locationName, setLocationName] = useState('Main Location');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState(typeof metadataName === 'string' ? metadataName : '');
  const [jobTitle, setJobTitle] = useState('Owner');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const disabled = submitting || restaurantName.trim().length < 2 || locationName.trim().length < 2 || ownerName.trim().length < 2 || jobTitle.trim().length < 2 || !timezone.trim();

  const submit = async () => {
    if (disabled || !supabase) return;
    setSubmitting(true);
    setError(undefined);

    const { error: setupError } = await supabase.rpc('bootstrap_owner', {
      restaurant_name: restaurantName.trim(),
      location_name: locationName.trim(),
      owner_full_name: ownerName.trim(),
      owner_job_title: jobTitle.trim(),
      restaurant_timezone: timezone.trim(),
      location_address: address.trim() || undefined,
    });

    if (setupError) {
      setError(setupError.message);
      setSubmitting(false);
      return;
    }

    await refreshMembership();
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brand}><View style={styles.logo}><Ionicons name="restaurant" size={19} color={colors.surface} /></View><Text style={styles.brandText}>TableTime</Text></View>
          <Pressable onPress={signOut} style={styles.signOut}><Text style={styles.signOutText}>Sign out</Text></Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.step}><Text style={styles.stepText}>OWNER SETUP · ONE QUICK STEP</Text></View>
          <Text style={styles.title}>Tell us about your restaurant</Text>
          <Text style={styles.subtitle}>This creates your secure workspace, first location, and owner employee profile.</Text>

          <View style={styles.grid}>
            <Field label="Restaurant name" value={restaurantName} onChangeText={setRestaurantName} placeholder="The Juniper Room" autoCapitalize="words" />
            <Field label="First location name" value={locationName} onChangeText={setLocationName} placeholder="Main Location" autoCapitalize="words" />
            <Field label="Location address (optional)" value={address} onChangeText={setAddress} placeholder="123 Main Street, Chicago, IL" autoCapitalize="words" />
            <Field label="Timezone" value={timezone} onChangeText={setTimezone} placeholder="America/Chicago" autoCapitalize="none" />
            <Field label="Your full name" value={ownerName} onChangeText={setOwnerName} placeholder="Jordan Lee" autoCapitalize="words" />
            <Field label="Your job title" value={jobTitle} onChangeText={setJobTitle} placeholder="Owner" autoCapitalize="words" />
          </View>

          {error ? <View style={styles.error}><Ionicons name="alert-circle" size={17} color={colors.red} /><Text style={styles.errorText}>{error}</Text></View> : null}

          <Pressable accessibilityRole="button" disabled={disabled} onPress={submit} style={({ pressed }) => [styles.submit, disabled && styles.submitDisabled, pressed && styles.pressed]}>
            {submitting ? <ActivityIndicator color={colors.surface} /> : <><Text style={styles.submitText}>Create restaurant workspace</Text><Ionicons name="arrow-forward" size={18} color={colors.surface} /></>}
          </Pressable>
          <View style={styles.secure}><Ionicons name="shield-checkmark" size={15} color={colors.forest} /><Text style={styles.secureText}>Your restaurant data is isolated from every other TableTime account.</Text></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; autoCapitalize: 'none' | 'words' }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#929B96" style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flexGrow: 1, padding: 24 },
  header: { width: '100%', maxWidth: 860, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, logo: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }, brandText: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  signOut: { paddingHorizontal: 14, paddingVertical: 9 }, signOutText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  card: { width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: Platform.OS === 'web' ? 38 : 24 },
  step: { alignSelf: 'flex-start', backgroundColor: colors.orangeSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 }, stepText: { color: '#A45120', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -1, marginTop: 18 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 28 },
  grid: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }, field: { width: Platform.OS === 'web' ? '48%' : '100%', flexGrow: 1, gap: 8 }, label: { color: colors.ink, fontSize: 12, fontWeight: '800' }, input: { height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.canvas, paddingHorizontal: 14, color: colors.ink, fontSize: 14 },
  error: { flexDirection: 'row', gap: 8, backgroundColor: colors.redSoft, borderRadius: 10, padding: 12, marginTop: 18 }, errorText: { flex: 1, color: colors.red, fontSize: 12, lineHeight: 17 },
  submit: { minHeight: 52, borderRadius: 12, marginTop: 24, backgroundColor: colors.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, submitDisabled: { opacity: 0.45 }, submitText: { color: colors.surface, fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.78 },
  secure: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 16 }, secureText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
});
