import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Avatar, Button, Card, PageTitle, StatusPill } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function TeamScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const { employees, dataLoading, dataError, refreshLiveData } = useApp();
  const [query, setQuery] = useState('');
  const [invited, setInvited] = useState(false);
  const filtered = useMemo(() => employees.filter((employee) => `${employee.name} ${employee.role}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <View>
      <PageTitle eyebrow={`${employees.length} ACTIVE MEMBERS`} title="Your team" subtitle="Manage roles, weekly hours, and employee status from one place." action={!compact ? <Button label={invited ? 'Invite sent' : 'Invite employee'} icon={invited ? 'checkmark' : 'person-add-outline'} onPress={() => setInvited(true)} /> : undefined} />
      <Card style={styles.tableCard}>
        <View style={styles.tools}>
          <View style={styles.search}><Ionicons name="search" size={17} color={colors.muted} /><TextInput accessibilityLabel="Search team" placeholder="Search team" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={styles.input} /></View>
          <Pressable style={styles.filter}><Ionicons name="options-outline" size={17} color={colors.ink} /><Text style={styles.filterText}>Filter</Text></Pressable>
        </View>
        {dataError ? <View style={styles.message}><Text style={styles.errorTitle}>Team data couldn’t load</Text><Text style={styles.emptyCopy}>{dataError}</Text><Pressable onPress={refreshLiveData}><Text style={styles.retry}>Try again</Text></Pressable></View> : null}
        {dataLoading ? <View style={styles.message}><ActivityIndicator color={colors.forest} /><Text style={styles.emptyCopy}>Loading your team…</Text></View> : null}
        {!compact && !dataLoading && !dataError ? (
          <View style={styles.tableHeader}><Text style={[styles.headerText, styles.personColumn]}>EMPLOYEE</Text><Text style={[styles.headerText, styles.roleColumn]}>ROLE</Text><Text style={[styles.headerText, styles.hoursColumn]}>LAST 7 DAYS</Text><Text style={[styles.headerText, styles.statusColumn]}>STATUS</Text><View style={styles.menuColumn} /></View>
        ) : null}
        {!dataLoading && !dataError ? filtered.map((employee) => (
          <View key={employee.id} style={styles.employeeRow}>
            <View style={[styles.personCell, styles.personColumn]}><Avatar initials={employee.initials} color={employee.color} /><View style={styles.personCopy}><Text style={styles.name}>{employee.name}</Text>{compact ? <Text style={styles.mobileRole}>{employee.role}</Text> : <Text style={styles.email}>{employee.email ?? 'No email connected'}</Text>}</View></View>
            {!compact ? <Text style={[styles.value, styles.roleColumn]}>{employee.role}</Text> : null}
            <View style={styles.hoursColumn}><Text style={styles.hours}>{employee.weeklyHours}h</Text><View style={styles.hoursTrack}><View style={[styles.hoursFill, { width: `${Math.min(100, employee.weeklyHours / 40 * 100)}%` }]} /></View></View>
            <View style={styles.statusColumn}><StatusPill label={employee.status === 'clocked-in' ? 'Working' : employee.status === 'break' ? 'On break' : 'Off shift'} tone={employee.status === 'clocked-in' ? 'green' : employee.status === 'break' ? 'orange' : 'gray'} /></View>
            {!compact ? <Pressable style={styles.menuColumn}><Ionicons name="ellipsis-horizontal" size={19} color={colors.muted} /></Pressable> : null}
          </View>
        )) : null}
        {!dataLoading && !dataError && filtered.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No team members found</Text><Text style={styles.emptyCopy}>{employees.length ? 'Try a different name or role.' : 'Add your first employee to start building the team.'}</Text></View> : null}
      </Card>
      {compact ? <View style={styles.mobileAction}><Button label={invited ? 'Invite sent' : 'Invite employee'} icon={invited ? 'checkmark' : 'person-add-outline'} onPress={() => setInvited(true)} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: { padding: 0, overflow: 'hidden' }, tools: { padding: 15, flexDirection: 'row', gap: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  search: { height: 40, flex: 1, maxWidth: 360, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.canvas, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, input: { flex: 1, height: '100%', color: colors.ink, fontSize: 13, outlineStyle: 'none' } as never,
  filter: { height: 40, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6 }, filterText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  tableHeader: { minHeight: 42, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.canvas }, headerText: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  employeeRow: { minHeight: 76, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }, personCell: { flexDirection: 'row', alignItems: 'center', gap: 11 }, personColumn: { flex: 2.1 }, roleColumn: { flex: 1.1 }, hoursColumn: { flex: 1 }, statusColumn: { flex: 0.8 }, menuColumn: { width: 28, alignItems: 'center' },
  personCopy: { flex: 1 }, name: { color: colors.ink, fontSize: 13, fontWeight: '800' }, email: { color: colors.muted, fontSize: 10, marginTop: 3 }, mobileRole: { color: colors.muted, fontSize: 10, marginTop: 3 }, value: { color: colors.ink, fontSize: 12 }, hours: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  hoursTrack: { width: 70, height: 4, borderRadius: 2, backgroundColor: colors.surfaceSoft, marginTop: 7 }, hoursFill: { height: '100%', borderRadius: 2, backgroundColor: colors.forest },
  empty: { padding: 40, alignItems: 'center' }, message: { padding: 40, alignItems: 'center', gap: 8 }, errorTitle: { color: colors.red, fontWeight: '800' }, retry: { color: colors.forest, fontSize: 12, fontWeight: '800', marginTop: 6 }, emptyTitle: { color: colors.ink, fontWeight: '800' }, emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 5, textAlign: 'center' }, mobileAction: { marginTop: 14 },
});
