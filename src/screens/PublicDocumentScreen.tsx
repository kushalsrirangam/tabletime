import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export type PublicDocumentKind = 'privacy' | 'terms' | 'delete-account';

const documents = {
  privacy: {
    eyebrow: 'PRIVACY',
    title: 'Privacy Policy',
    intro: 'Effective August 22, 2026. TableTime Staff provides restaurant scheduling, time-clock, break, request, and workforce-management tools.',
    sections: [
      ['Information we process', 'TableTime may process account details, name, work email, work phone, job title, restaurant role, work location, employment status, hourly rate, assigned shifts, punch and break timestamps, time-off requests, restaurant details, session information, and security audit events. Authentication credentials are encrypted and handled by our authentication provider.'],
      ['What we do not collect', 'The current app does not request device location, camera, microphone, contacts, photos, health, or advertising-tracking permission. We do not sell personal information or use it for targeted advertising.'],
      ['How information is used', 'Information is used to authenticate users, operate restaurant schedules and time clocks, show data to authorized restaurant users, process requests, protect workspaces, troubleshoot failures, and meet applicable legal obligations.'],
      ['Sharing and providers', 'Supabase provides authentication, database, server functions, and realtime synchronization. Vercel provides web hosting and delivery. Authorized owners and managers can access workforce information in their own restaurant. Information may also be disclosed when required by law.'],
      ['Retention and deletion', 'Restaurants may need to retain attendance and employment records for legal, tax, payroll, or dispute purposes. When an account is deleted, access is removed and personal information is deleted or de-identified unless retention is legally required.'],
      ['Security', 'TableTime uses encrypted connections, row-level database security, tenant separation, role-based access, authenticated server functions, and audit records. No security method can guarantee absolute protection.'],
      ['Your rights', 'Users may request access, correction, export, or deletion of personal information. Eligible profile information can be updated by an authorized restaurant manager.'],
      ['Children and international processing', 'TableTime is a workplace service and is not directed to children under 13. Information may be processed in the United States and other locations where our providers operate.'],
      ['Contact', 'Open a support request through the TableTime repository support tracker. Do not include passwords or sensitive employment details. A dedicated public support email and legal mailing address will be added before the public store release.'],
    ],
  },
  terms: {
    eyebrow: 'TERMS',
    title: 'Terms of Service',
    intro: 'Effective August 22, 2026. These terms govern access to TableTime Staff.',
    sections: [
      ['Service', 'TableTime provides scheduling, time-clock, break, request, and workforce-management software. It is an operational aid, not payroll, legal, tax, accounting, or employment advice.'],
      ['Accounts and access', 'Provide accurate information, protect your credentials, and use only accounts you are authorized to access. Owners and managers control restaurant membership and employee permissions.'],
      ['Acceptable use', 'Do not bypass access controls, interfere with availability, access another restaurant’s data, upload unlawful content, or use the service to violate employment or privacy laws.'],
      ['Restaurant responsibilities', 'Restaurants remain responsible for reviewing records, paying employees correctly, complying with break and overtime rules, obtaining required notices or consent, and resolving employee disputes.'],
      ['Availability', 'Maintenance, network failures, provider disruptions, or changes may temporarily interrupt the service. Features may change to improve reliability, security, and usability.'],
      ['Termination and deletion', 'Users may stop using TableTime or request deletion. Access may be suspended for security risks, misuse, or legal requirements. Records may be retained or de-identified where legally required.'],
      ['Disclaimer', 'To the maximum extent permitted by law, the service is provided as is without a guarantee of uninterrupted or error-free operation. Some jurisdictions do not allow certain limitations.'],
      ['Contact', 'Support requests can be opened through the TableTime repository support tracker. Final legal entity and jurisdiction details will be added before public release.'],
    ],
  },
  'delete-account': {
    eyebrow: 'ACCOUNT CONTROL',
    title: 'Delete your account',
    intro: 'TableTime users can start account deletion from inside the signed-in app without contacting a manager.',
    sections: [
      ['How to request deletion', 'Sign in, open Account, choose Delete account, review what will happen, and confirm. Your sign-in access is removed and personal details are deleted or de-identified.'],
      ['Restaurant records', 'Schedules, punches, breaks, and approvals may need to remain as de-identified restaurant records for payroll, employment, tax, security, or legal obligations.'],
      ['Restaurant owners', 'A sole owner must transfer ownership before deleting an account if other restaurant members remain. An owner who is the only member can delete the restaurant workspace as part of account deletion.'],
      ['Need help?', 'If you cannot sign in, open a support request. Do not include passwords, hourly rates, schedules, or other sensitive employment details in a public issue.'],
    ],
  },
} as const;

export function PublicDocumentScreen({ kind }: { kind: PublicDocumentKind }) {
  const document = documents[kind];
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandMark}><Ionicons name="restaurant" size={22} color={colors.surface} /></View>
        <Text style={styles.brand}>TableTime Staff</Text>
      </View>
      <View style={styles.document}>
        <Text style={styles.eyebrow}>{document.eyebrow}</Text>
        <Text accessibilityRole="header" style={styles.title}>{document.title}</Text>
        <Text style={styles.intro}>{document.intro}</Text>
        {document.sections.map(([heading, copy]) => (
          <View key={heading} style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>{heading}</Text>
            <Text style={styles.copy}>{copy}</Text>
          </View>
        ))}
        <View style={styles.actions}>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://tabletime-3qn4.vercel.app/')} style={styles.primary}><Text style={styles.primaryText}>Open TableTime</Text></Pressable>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://github.com/kushalsrirangam/tabletime/issues')} style={styles.secondary}><Text style={styles.secondaryText}>Support tracker</Text></Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  page: { width: '100%', maxWidth: 840, alignSelf: 'center', paddingHorizontal: 22, paddingVertical: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 26 },
  brandMark: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest },
  brand: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  document: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 30 },
  eyebrow: { color: colors.orange, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 34, lineHeight: 41, fontWeight: '800', marginTop: 8 },
  intro: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 8 },
  section: { marginTop: 24 },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 7 },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 30, paddingTop: 22, borderTopWidth: 1, borderTopColor: colors.border },
  primary: { minHeight: 44, borderRadius: 11, backgroundColor: colors.forest, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.surface, fontSize: 13, fontWeight: '800' },
  secondary: { minHeight: 44, borderRadius: 11, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
});
