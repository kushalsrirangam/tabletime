import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { ChoiceField, FormField, FormModal } from '../components/FormModal';
import { Avatar, Button, Card, PageTitle, StatusPill } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { Employee, EmploymentStatus, SaveEmployeeInput } from '../types';

type TeamFilter = 'all' | EmploymentStatus;

const teamFilters: Array<{ label: string; value: TeamFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Invited', value: 'invited' },
  { label: 'Inactive', value: 'inactive' },
];

function statusPresentation(employee: Employee): { label: string; tone: 'green' | 'orange' | 'red' | 'gray' } {
  if (employee.employmentStatus === 'inactive') return { label: 'Inactive', tone: 'red' };
  if (employee.employmentStatus === 'invited') return { label: 'Invited', tone: 'orange' };
  if (employee.status === 'clocked-in') return { label: 'Working', tone: 'green' };
  if (employee.status === 'break') return { label: 'On break', tone: 'orange' };
  return { label: 'Off shift', tone: 'gray' };
}

export function TeamScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const { employees, locations, dataLoading, dataError, refreshLiveData, saveEmployee } = useApp();
  const { workspace } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TeamFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [primaryLocationId, setPrimaryLocationId] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();

  const activeCount = employees.filter((employee) => employee.employmentStatus === 'active').length;
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => employees.filter((employee) => {
    const matchesFilter = filter === 'all' || employee.employmentStatus === filter;
    const searchable = `${employee.name} ${employee.email ?? ''} ${employee.role} ${employee.primaryLocationName ?? ''}`.toLowerCase();
    return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [employees, filter, normalizedQuery]);

  const resetForm = (employee?: Employee) => {
    setEditingEmployee(employee);
    setName(employee?.name ?? '');
    setEmail(employee?.email ?? '');
    setPhone(employee?.phone ?? '');
    setJobTitle(employee?.role ?? '');
    setHourlyRate(employee?.hourlyRateCents === undefined ? '' : (employee.hourlyRateCents / 100).toFixed(2));
    setPrimaryLocationId(employee?.primaryLocationId ?? locations[0]?.id ?? '');
    setEmploymentStatus(employee?.employmentStatus ?? 'active');
    setFormError(undefined);
    setModalOpen(true);
  };

  const closeForm = () => {
    if (!submitting) setModalOpen(false);
  };

  const normalizedEmail = email.trim();
  const emailValid = !normalizedEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const numericHourlyRate = hourlyRate.trim() ? Number(hourlyRate) : undefined;
  const hourlyRateValid = numericHourlyRate === undefined || (Number.isFinite(numericHourlyRate) && numericHourlyRate >= 0 && numericHourlyRate <= 10_000);
  const canSubmit = name.trim().length >= 2 && jobTitle.trim().length >= 1 && emailValid && hourlyRateValid;
  const editingSelf = editingEmployee?.id === workspace?.employeeId;

  const submitEmployee = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setFormError(undefined);
    const input: SaveEmployeeInput = {
      id: editingEmployee?.id,
      name,
      email: normalizedEmail || undefined,
      phone: phone.trim() || undefined,
      role: jobTitle,
      primaryLocationId: primaryLocationId || undefined,
      hourlyRateCents: numericHourlyRate === undefined ? undefined : Math.round(numericHourlyRate * 100),
      employmentStatus,
    };
    try {
      await saveEmployee(input);
      setModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Employee details could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <PageTitle
        eyebrow={`${activeCount} ACTIVE ${activeCount === 1 ? 'MEMBER' : 'MEMBERS'}`}
        title="Your team"
        subtitle="Add staff, update workforce details, and manage employment status."
        action={!compact ? <Button label="Add employee" icon="person-add-outline" onPress={() => resetForm()} /> : undefined}
      />
      <Card style={styles.tableCard}>
        <View style={[styles.tools, compact && styles.toolsCompact]}>
          <View style={styles.search}><Ionicons name="search" size={17} color={colors.muted} /><TextInput accessibilityLabel="Search team" placeholder="Search name, email, role, or location" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={styles.input} /></View>
          <View accessibilityRole="tablist" style={styles.filters}>
            {teamFilters.map((option) => <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected: filter === option.value }} onPress={() => setFilter(option.value)} style={[styles.filter, filter === option.value && styles.filterActive]}><Text style={[styles.filterText, filter === option.value && styles.filterTextActive]}>{option.label}</Text></Pressable>)}
          </View>
        </View>
        {dataError ? <View style={styles.message}><Text style={styles.errorTitle}>Team data couldn’t load</Text><Text accessibilityRole="alert" style={styles.emptyCopy}>{dataError}</Text><Button label="Try again" icon="refresh-outline" compact variant="secondary" loading={dataLoading} onPress={() => { void refreshLiveData(); }} /></View> : null}
        {dataLoading && !dataError ? <View style={styles.message}><ActivityIndicator color={colors.forest} /><Text style={styles.emptyCopy}>Loading your team…</Text></View> : null}
        {!compact && !dataLoading && !dataError ? (
          <View style={styles.tableHeader}><Text style={[styles.headerText, styles.personColumn]}>EMPLOYEE</Text><Text style={[styles.headerText, styles.roleColumn]}>ROLE</Text><Text style={[styles.headerText, styles.hoursColumn]}>LAST 7 DAYS</Text><Text style={[styles.headerText, styles.statusColumn]}>STATUS</Text><View style={styles.menuColumn} /></View>
        ) : null}
        {!dataLoading && !dataError ? filtered.map((employee) => {
          const presentation = statusPresentation(employee);
          return (
            <View key={employee.id} style={styles.employeeRow}>
              <View style={[styles.personCell, styles.personColumn]}><Avatar initials={employee.initials} color={employee.color} /><View style={styles.personCopy}><Text style={styles.name}>{employee.name}</Text><Text numberOfLines={1} style={styles.email}>{compact ? employee.role : employee.email ?? 'No email connected'}{employee.primaryLocationName ? ` · ${employee.primaryLocationName}` : ''}</Text></View></View>
              {!compact ? <Text style={[styles.value, styles.roleColumn]}>{employee.role}</Text> : null}
              <View style={styles.hoursColumn}><Text style={styles.hours}>{employee.weeklyHours}h</Text><View style={styles.hoursTrack}><View style={[styles.hoursFill, { width: `${Math.min(100, employee.weeklyHours / 40 * 100)}%` }]} /></View></View>
              <View style={styles.statusColumn}><StatusPill label={presentation.label} tone={presentation.tone} /></View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${employee.name}`} onPress={() => resetForm(employee)} style={styles.menuColumn}><Ionicons name="create-outline" size={18} color={colors.muted} /></Pressable>
            </View>
          );
        }) : null}
        {!dataLoading && !dataError && filtered.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No team members found</Text><Text style={styles.emptyCopy}>{employees.length ? 'Try a different search or status filter.' : 'Add your first employee to start building the team.'}</Text></View> : null}
      </Card>
      {compact ? <View style={styles.mobileAction}><Button label="Add employee" icon="person-add-outline" onPress={() => resetForm()} /></View> : null}

      <FormModal
        visible={modalOpen}
        title={editingEmployee ? `Edit ${editingEmployee.name}` : 'Add employee'}
        subtitle={editingEmployee ? 'Update roster details, primary location, pay, or employment status.' : 'Create a staff record for scheduling and time tracking. App login invitations are handled separately.'}
        submitLabel={editingEmployee ? 'Save changes' : 'Add employee'}
        canSubmit={canSubmit}
        submitting={submitting}
        onClose={closeForm}
        onSubmit={() => { void submitEmployee(); }}
      >
        <FormField label="Full name" value={name} placeholder="Maya Brooks" autoCapitalize="words" onChangeText={setName} />
        <FormField label="Work email (optional)" value={email} placeholder="maya@restaurant.com" keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
        {!emailValid ? <Text accessibilityRole="alert" style={styles.formError}>Enter a valid work email.</Text> : null}
        <FormField label="Phone (optional)" value={phone} placeholder="(555) 123-4567" keyboardType="phone-pad" onChangeText={setPhone} />
        <FormField label="Job title" value={jobTitle} placeholder="Server" autoCapitalize="words" onChangeText={setJobTitle} />
        <FormField label="Hourly rate (optional)" value={hourlyRate} placeholder="18.50" keyboardType="decimal-pad" onChangeText={setHourlyRate} />
        {!hourlyRateValid ? <Text accessibilityRole="alert" style={styles.formError}>Enter a valid non-negative hourly rate.</Text> : null}
        <ChoiceField label="Primary location" value={primaryLocationId} onChange={setPrimaryLocationId} options={[{ label: 'Unassigned', value: '' }, ...locations.map((location) => ({ label: location.name, value: location.id }))]} />
        <ChoiceField label="Employment status" value={employmentStatus} onChange={(value) => setEmploymentStatus(value === 'inactive' || value === 'invited' ? value : 'active')} options={editingSelf ? [{ label: 'Active', value: 'active' }] : [...(editingEmployee?.employmentStatus === 'invited' ? [{ label: 'Invited', value: 'invited' }] : []), { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
        {editingSelf ? <Text style={styles.formNote}>Your connected employee profile must remain active. Another manager can manage it if needed.</Text> : null}
        <View style={styles.accountNote}><Ionicons name={editingEmployee?.userId ? 'shield-checkmark-outline' : 'mail-unread-outline'} size={18} color={colors.forest} /><Text style={styles.accountNoteText}>{editingEmployee?.userId ? 'An app account is connected. Changing the work email here does not change their sign-in email.' : 'No app login is connected yet. The employee can be scheduled now; secure invitations are a separate task.'}</Text></View>
        {formError ? <Text accessibilityRole="alert" style={styles.formErrorBox}>{formError}</Text> : null}
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: { padding: 0, overflow: 'hidden' }, tools: { padding: 15, flexDirection: 'row', gap: 9, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' }, toolsCompact: { flexDirection: 'column', alignItems: 'stretch' },
  search: { height: 40, flex: 1, maxWidth: 420, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.canvas, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, input: { flex: 1, height: '100%', color: colors.ink, fontSize: 13, outlineStyle: 'none' } as never,
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, filter: { minHeight: 36, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' }, filterActive: { backgroundColor: colors.forest, borderColor: colors.forest }, filterText: { color: colors.ink, fontSize: 11, fontWeight: '700' }, filterTextActive: { color: colors.surface },
  tableHeader: { minHeight: 42, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.canvas }, headerText: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  employeeRow: { minHeight: 76, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }, personCell: { flexDirection: 'row', alignItems: 'center', gap: 11 }, personColumn: { flex: 2.1 }, roleColumn: { flex: 1.1 }, hoursColumn: { flex: 1 }, statusColumn: { flex: 0.8, minWidth: 74 }, menuColumn: { width: 34, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  personCopy: { flex: 1 }, name: { color: colors.ink, fontSize: 13, fontWeight: '800' }, email: { color: colors.muted, fontSize: 10, marginTop: 3 }, value: { color: colors.ink, fontSize: 12 }, hours: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  hoursTrack: { width: 70, height: 4, borderRadius: 2, backgroundColor: colors.surfaceSoft, marginTop: 7 }, hoursFill: { height: '100%', borderRadius: 2, backgroundColor: colors.forest },
  empty: { padding: 40, alignItems: 'center' }, message: { padding: 40, alignItems: 'center', gap: 8 }, errorTitle: { color: colors.red, fontWeight: '800' }, emptyTitle: { color: colors.ink, fontWeight: '800' }, emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 5, textAlign: 'center' }, mobileAction: { marginTop: 14 },
  formError: { color: colors.red, fontSize: 11, fontWeight: '700', marginTop: -10 }, formNote: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: -9 }, formErrorBox: { color: colors.red, backgroundColor: colors.redSoft, borderRadius: 9, padding: 11, fontSize: 11, lineHeight: 16 },
  accountNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, backgroundColor: colors.mint, borderRadius: 10 }, accountNoteText: { flex: 1, color: colors.forestDark, fontSize: 11, lineHeight: 16 },
});
