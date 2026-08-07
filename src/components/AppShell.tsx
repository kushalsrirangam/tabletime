import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, radius } from '../theme';
import { TabKey, UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

type NavItem = { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; managerOnly?: boolean };
const navItems: NavItem[] = [
  { key: 'home', label: 'Overview', icon: 'grid-outline' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar-outline' },
  { key: 'clock', label: 'Time clock', icon: 'time-outline' },
  { key: 'team', label: 'Team', icon: 'people-outline', managerOnly: true },
  { key: 'requests', label: 'Requests', icon: 'file-tray-full-outline' },
];

type Props = { activeTab: TabKey; onTabChange: (tab: TabKey) => void; children: React.ReactNode };

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TT';
}

function RoleSwitch({ role, onChange }: { role: UserRole; onChange: (role: UserRole) => void }) {
  return (
    <View style={styles.roleSwitch}>
      {(['manager', 'employee'] as UserRole[]).map((item) => (
        <Pressable key={item} onPress={() => onChange(item)} style={[styles.roleOption, role === item && styles.roleOptionActive]}>
          <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item === 'manager' ? 'Manager' : 'Employee'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AppShell({ activeTab, onTabChange, children }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { role, setRole, requests } = useApp();
  const { backendConfigured, signOut, workspace } = useAuth();
  const visibleNav = navItems.filter((item) => role === 'manager' || !item.managerOnly);
  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const restaurantName = workspace?.organizationName ?? 'The Juniper Room';
  const locationName = workspace?.locationName ?? (backendConfigured ? 'Restaurant workspace' : 'North Loop · Chicago');
  const personName = workspace?.fullName ?? 'Jordan Lee';
  const personRole = workspace?.jobTitle ?? (role === 'manager' ? 'General Manager' : 'Team member');

  return (
    <View style={styles.root}>
      {isDesktop ? (
        <View style={styles.sidebar}>
          <View style={styles.brandRow}>
            <View style={styles.logo}><Ionicons name="restaurant" size={18} color={colors.surface} /></View>
            <Text style={styles.brand}>TableTime</Text>
          </View>
          <Text style={styles.location}>{locationName.toUpperCase()}</Text>
          <View style={styles.nav}>
            {visibleNav.map((item) => (
              <Pressable key={item.key} onPress={() => onTabChange(item.key)} style={({ pressed }) => [styles.navItem, activeTab === item.key && styles.navItemActive, pressed && styles.pressed]}>
                <Ionicons name={item.icon} size={20} color={activeTab === item.key ? colors.surface : '#AEBAB4'} />
                <Text style={[styles.navLabel, activeTab === item.key && styles.navLabelActive]}>{item.label}</Text>
                {item.key === 'requests' && pendingCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{pendingCount}</Text></View> : null}
              </Pressable>
            ))}
          </View>
          <View style={styles.sidebarBottom}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initialsFor(personName)}</Text></View>
            <View style={styles.identity}>
              <Text style={styles.identityName}>{personName}</Text>
              <Text style={styles.identityRole}>{personRole}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={backendConfigured ? 'Sign out' : 'Demo mode'} onPress={backendConfigured ? signOut : undefined} style={styles.accountAction}>
              <Ionicons name={backendConfigured ? 'log-out-outline' : 'flask-outline'} size={19} color="#AEBAB4" />
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.main}>
        <View style={styles.topbar}>
          {!isDesktop ? (
            <View style={styles.mobileBrand}>
              <View style={styles.logo}><Ionicons name="restaurant" size={16} color={colors.surface} /></View>
              <Text style={styles.mobileBrandText}>TableTime</Text>
            </View>
          ) : <Text style={styles.restaurantName}>{restaurantName}</Text>}
          {!backendConfigured ? <RoleSwitch role={role} onChange={(nextRole) => { setRole(nextRole); if (nextRole === 'employee' && activeTab === 'team') onTabChange('home'); }} /> : null}
          {!backendConfigured && isDesktop ? <View style={styles.demoPill}><View style={styles.demoDot} /><Text style={styles.demoText}>DEMO</Text></View> : null}
          {backendConfigured && !isDesktop ? <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={signOut} style={styles.iconButton}><Ionicons name="log-out-outline" size={20} color={colors.ink} /></Pressable> : null}
          {isDesktop ? (
            <Pressable style={styles.iconButton}><Ionicons name="notifications-outline" size={21} color={colors.ink} /><View style={styles.dot} /></Pressable>
          ) : null}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, !isDesktop && styles.mobileContent]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        {!isDesktop ? (
          <View style={styles.bottomNav}>
            {visibleNav.map((item) => (
              <Pressable key={item.key} onPress={() => onTabChange(item.key)} style={styles.bottomItem}>
                <View>
                  <Ionicons name={item.icon} size={22} color={activeTab === item.key ? colors.forest : colors.muted} />
                  {item.key === 'requests' && pendingCount > 0 ? <View style={styles.mobileDot} /> : null}
                </View>
                <Text style={[styles.bottomLabel, activeTab === item.key && styles.bottomLabelActive]}>{item.label === 'Time clock' ? 'Clock' : item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.canvas },
  sidebar: { width: 236, backgroundColor: colors.ink, paddingHorizontal: 18, paddingTop: 32, paddingBottom: 22 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  logo: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  brand: { color: colors.surface, fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },
  location: { color: '#809088', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginTop: 24, marginLeft: 8 },
  nav: { gap: 5, marginTop: 18 },
  navItem: { minHeight: 46, borderRadius: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  navItemActive: { backgroundColor: colors.forest }, pressed: { opacity: 0.75 },
  navLabel: { color: '#AEBAB4', fontSize: 14, fontWeight: '600', flex: 1 }, navLabelActive: { color: colors.surface },
  badge: { minWidth: 21, height: 21, paddingHorizontal: 6, borderRadius: 11, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.surface, fontSize: 11, fontWeight: '800' },
  sidebarBottom: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#2D3733', paddingTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DCE9E2', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.forestDark, fontSize: 13, fontWeight: '800' }, identity: { flex: 1 },
  identityName: { color: colors.surface, fontWeight: '700', fontSize: 13 }, identityRole: { color: '#829189', fontSize: 11, marginTop: 2 },
  accountAction: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1 },
  topbar: { minHeight: 72, paddingHorizontal: 28, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 14 },
  restaurantName: { fontSize: 14, fontWeight: '700', color: colors.ink, marginRight: 'auto' },
  mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 'auto' }, mobileBrandText: { fontSize: 18, fontWeight: '800', color: colors.ink },
  roleSwitch: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft },
  roleOption: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill }, roleOptionActive: { backgroundColor: colors.surface },
  roleText: { color: colors.muted, fontSize: 11, fontWeight: '700' }, roleTextActive: { color: colors.ink },
  demoPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.orangeSoft }, demoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange }, demoText: { color: '#9A4F22', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  iconButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orange, right: 8, top: 7, borderWidth: 1, borderColor: colors.surface },
  scroll: { flex: 1 }, content: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: 34, paddingTop: 30, paddingBottom: 42 },
  mobileContent: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 100 },
  bottomNav: { minHeight: 76, paddingBottom: 8, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' }, bottomLabelActive: { color: colors.forest, fontWeight: '800' },
  mobileDot: { position: 'absolute', right: -4, top: -1, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orange },
});
