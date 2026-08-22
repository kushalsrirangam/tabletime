import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormField, FormModal } from '../components/FormModal';
import { Card, PageTitle } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const publicLinks = [
  { label: 'Privacy policy', url: 'https://tabletime-3qn4.vercel.app/privacy', icon: 'shield-checkmark-outline' as const },
  { label: 'Terms of service', url: 'https://tabletime-3qn4.vercel.app/terms', icon: 'document-text-outline' as const },
  { label: 'Account deletion information', url: 'https://tabletime-3qn4.vercel.app/delete-account', icon: 'person-remove-outline' as const },
  { label: 'Support tracker', url: 'https://github.com/kushalsrirangam/tabletime/issues', icon: 'help-circle-outline' as const },
];

export function AccountScreen() {
  const { session, workspace, deleteAccount, signOut } = useAuth();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<string>();

  const closeDeletion = () => {
    if (deleting) return;
    setDeleteVisible(false);
    setPassword('');
    setConfirmation('');
    setDeletionError(undefined);
  };

  const submitDeletion = async () => {
    if (!password || confirmation !== 'DELETE' || deleting) return;
    setDeleting(true);
    setDeletionError(undefined);
    const result = await deleteAccount(password);
    if (result.error) {
      setDeletionError(result.error);
      setDeleting(false);
      return;
    }
    setDeleting(false);
    setDeleteVisible(false);
    Alert.alert('Account deleted', result.message ?? 'Your account was deleted.');
  };

  return (
    <View>
      <PageTitle eyebrow="ACCOUNT" title="Your account" subtitle="Review your restaurant access, legal information, and account controls." />
      <View style={styles.grid}>
        <Card style={styles.profileCard}>
          <View style={styles.iconCircle}><Ionicons name="person-outline" size={24} color={colors.forest} /></View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{workspace?.fullName ?? 'Team member'}</Text>
            <Text style={styles.email}>{session?.user.email ?? 'No email available'}</Text>
            <View style={styles.metaRow}><Text style={styles.metaLabel}>Restaurant</Text><Text style={styles.metaValue}>{workspace?.organizationName ?? 'Not assigned'}</Text></View>
            <View style={styles.metaRow}><Text style={styles.metaLabel}>Access</Text><Text style={styles.metaValue}>{workspace?.role ?? 'Not assigned'}</Text></View>
            <View style={styles.metaRow}><Text style={styles.metaLabel}>Position</Text><Text style={styles.metaValue}>{workspace?.jobTitle ?? 'Not assigned'}</Text></View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.signOutButton}><Ionicons name="log-out-outline" size={18} color={colors.ink} /><Text style={styles.signOutText}>Sign out</Text></Pressable>
        </Card>

        <Card style={styles.linksCard}>
          <Text style={styles.cardTitle}>Privacy and support</Text>
          <Text style={styles.cardCopy}>Public information about how TableTime handles data and account controls.</Text>
          <View style={styles.links}>
            {publicLinks.map((item) => (
              <Pressable key={item.url} accessibilityRole="link" onPress={() => void Linking.openURL(item.url)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
                <Ionicons name={item.icon} size={19} color={colors.forest} />
                <Text style={styles.linkLabel}>{item.label}</Text>
                <Ionicons name="open-outline" size={17} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </Card>
      </View>

      <Card style={styles.dangerCard}>
        <View style={styles.dangerIcon}><Ionicons name="warning-outline" size={21} color={colors.red} /></View>
        <View style={styles.dangerCopy}>
          <Text style={styles.dangerTitle}>Delete account</Text>
          <Text style={styles.dangerText}>Permanently remove your sign-in and de-identify personal details in retained restaurant records. A sole owner must transfer ownership first if other team members remain.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setDeleteVisible(true)} style={styles.deleteButton}><Text style={styles.deleteButtonText}>Delete account</Text></Pressable>
      </Card>

      <FormModal
        visible={deleteVisible}
        title="Permanently delete account?"
        subtitle="This cannot be undone. Your current password is required to confirm your identity."
        submitLabel="Permanently delete"
        submitVariant="danger"
        canSubmit={Boolean(password) && confirmation === 'DELETE'}
        submitting={deleting}
        onClose={closeDeletion}
        onSubmit={() => { void submitDeletion(); }}
      >
        <View style={styles.warningBox}><Ionicons name="information-circle-outline" size={19} color={colors.red} /><Text style={styles.warningText}>Your app access will end immediately. Legally required attendance records may remain without your direct identifiers.</Text></View>
        <FormField label="Current password" value={password} onChangeText={setPassword} placeholder="Enter your password" autoCapitalize="none" secureTextEntry autoComplete="current-password" />
        <FormField label="Type DELETE to confirm" value={confirmation} onChangeText={setConfirmation} placeholder="DELETE" autoCapitalize="characters" />
        {deletionError ? <View accessibilityRole="alert" style={styles.errorBox}><Ionicons name="alert-circle" size={18} color={colors.red} /><Text style={styles.errorText}>{deletionError}</Text></View> : null}
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  profileCard: { flex: 1, minWidth: 290, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1 }, name: { color: colors.ink, fontSize: 18, fontWeight: '800' }, email: { color: colors.muted, fontSize: 12, marginTop: 3, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 8 }, metaLabel: { color: colors.muted, fontSize: 11 }, metaValue: { flex: 1, color: colors.ink, fontSize: 11, fontWeight: '700', textAlign: 'right', textTransform: 'capitalize' },
  signOutButton: { minHeight: 38, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }, signOutText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  linksCard: { flex: 1, minWidth: 290 }, cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' }, cardCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, links: { marginTop: 14 },
  linkRow: { minHeight: 44, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }, linkLabel: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: '700' }, pressed: { opacity: 0.7 },
  dangerCard: { marginTop: 16, borderColor: colors.red, backgroundColor: colors.redSoft, flexDirection: 'row', alignItems: 'center', gap: 13 }, dangerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, dangerCopy: { flex: 1 }, dangerTitle: { color: colors.red, fontSize: 14, fontWeight: '800' }, dangerText: { color: colors.red, fontSize: 11, lineHeight: 17, marginTop: 3 },
  deleteButton: { minHeight: 40, borderRadius: 10, backgroundColor: colors.red, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }, deleteButtonText: { color: colors.surface, fontSize: 11, fontWeight: '800' },
  warningBox: { flexDirection: 'row', gap: 9, borderRadius: 10, backgroundColor: colors.redSoft, padding: 12 }, warningText: { flex: 1, color: colors.red, fontSize: 11, lineHeight: 17 },
  errorBox: { flexDirection: 'row', gap: 8, borderRadius: 10, backgroundColor: colors.redSoft, padding: 11 }, errorText: { flex: 1, color: colors.red, fontSize: 11, lineHeight: 17 },
});
