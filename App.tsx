import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from './src/components/AppShell';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ClockScreen } from './src/screens/ClockScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { TeamScreen } from './src/screens/TeamScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { InvitationSetupScreen } from './src/screens/InvitationSetupScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { PublicDocumentKind, PublicDocumentScreen } from './src/screens/PublicDocumentScreen';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { colors } from './src/theme';
import { TabKey } from './src/types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const screen = {
    home: <HomeScreen onNavigate={setActiveTab} />,
    schedule: <ScheduleScreen />,
    clock: <ClockScreen />,
    team: <TeamScreen />,
    requests: <RequestsScreen />,
    account: <AccountScreen />,
  }[activeTab];

  return <AppShell activeTab={activeTab} onTabChange={setActiveTab}>{screen}</AppShell>;
}

export default function App() {
  const publicDocument = getPublicDocument();
  if (publicDocument) return <AppErrorBoundary><PublicDocumentScreen kind={publicDocument} /></AppErrorBoundary>;
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.app}><AuthGate /></View>
            <StatusBar style="dark" />
          </SafeAreaView>
        </AppProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

function getPublicDocument(): PublicDocumentKind | undefined {
  if (typeof window === 'undefined') return undefined;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/delete-account') return 'delete-account';
  return undefined;
}

function AuthGate() {
  const { backendConfigured, loading, session, workspaceLoading, workspaceError, hasMembership, invitationLoading, invitationPending, refreshMembership, signOut } = useAuth();
  if (loading || invitationLoading || (backendConfigured && session && workspaceLoading && !invitationPending)) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.forest} /></View>;
  if (backendConfigured && invitationPending) return <InvitationSetupScreen />;
  if (backendConfigured && !session) return <LoginScreen />;
  if (backendConfigured && session && workspaceError) return <View style={styles.loading}><Text style={styles.errorTitle}>We couldn’t load your restaurant</Text><Text style={styles.errorCopy}>{workspaceError}</Text><View style={styles.errorActions}><Pressable onPress={refreshMembership} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable><Pressable onPress={signOut} style={styles.signOut}><Text style={styles.signOutText}>Sign out</Text></Pressable></View></View>;
  if (backendConfigured && session && !hasMembership) return <OnboardingScreen />;
  return <AppContent />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Platform.OS === 'web' ? colors.canvas : colors.surface },
  app: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
  errorTitle: { color: colors.ink, fontSize: 22, fontWeight: '800' }, errorCopy: { color: colors.muted, fontSize: 13, marginTop: 8, textAlign: 'center' }, errorActions: { flexDirection: 'row', gap: 10, marginTop: 20 }, retry: { borderRadius: 10, backgroundColor: colors.forest, paddingHorizontal: 18, paddingVertical: 11 }, retryText: { color: colors.surface, fontSize: 12, fontWeight: '800' }, signOut: { borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, paddingVertical: 11 }, signOutText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
});
