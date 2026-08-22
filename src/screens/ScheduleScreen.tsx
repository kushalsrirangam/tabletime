import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Avatar, Button, Card, PageTitle, StatusPill } from '../components/UI';
import { ChoiceField, FormField, FormModal } from '../components/FormModal';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { Employee, NewShiftInput, Shift } from '../types';

function calendarDays(timeZone: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() + index * 86_400_000);
    const parts = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    return {
      name: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(date),
      fullName: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(date),
      date: value('day'),
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone }).format(date),
      dateIso: `${value('year')}-${value('month')}-${value('day')}`,
    };
  });
}

function localDateTimeToIso(dateIso: string, timeText: string, timeZone: string) {
  const match = timeText.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  const minute = Number(match[2] ?? 0);
  if (minute > 59) return;
  const [year, month, day] = dateIso.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone });
  for (let index = 0; index < 3; index += 1) {
    const parts = formatter.formatToParts(new Date(guess));
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    const displayed = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'));
    guess += target - displayed;
  }
  return new Date(guess).toISOString();
}

export function ScheduleScreen() {
  const { role, shifts, employees, dataLoading, dataError, refreshLiveData, addShift, publishSchedule } = useApp();
  const { workspace } = useAuth();
  const { width } = useWindowDimensions();
  const mobile = width < 720;
  const timeZone = workspace?.organizationTimezone ?? 'America/Chicago';
  const days = useMemo(() => calendarDays(timeZone), [timeZone]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [shiftDay, setShiftDay] = useState(days[0].fullName);
  const [shiftDate, setShiftDate] = useState(days[0].label);
  const [shiftDateIso, setShiftDateIso] = useState(days[0].dateIso);
  const [start, setStart] = useState('4:00 PM');
  const [end, setEnd] = useState('10:00 PM');
  const [shiftRole, setShiftRole] = useState('Server');
  const [formError, setFormError] = useState<string>();
  const ownEmployeeId = workspace?.employeeId ?? 'e1';
  const activeEmployees = employees.filter((employee) => employee.employmentStatus === 'active');
  const visibleShifts = role === 'employee' ? shifts.filter((shift) => shift.employeeId === ownEmployeeId) : shifts;
  const unpublishedCount = shifts.filter((shift) => !shift.published).length;
  const scheduledHours = visibleShifts.reduce((total, shift) => total + (shift.startsAt && shift.endsAt ? Math.max(0, new Date(shift.endsAt).getTime() - new Date(shift.startsAt).getTime()) / 3_600_000 : 0), 0);

  const submitShift = async () => {
    let startsAt = localDateTimeToIso(shiftDateIso, start, timeZone);
    let endsAt = localDateTimeToIso(shiftDateIso, end, timeZone);
    if (!startsAt || !endsAt) {
      setFormError('Use a time such as 4:00 PM.');
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      const nextDate = new Date(`${shiftDateIso}T12:00:00Z`);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      endsAt = localDateTimeToIso(nextDate.toISOString().slice(0, 10), end, timeZone);
    }
    if (!endsAt) return;
    const input: NewShiftInput = { employeeId: selectedEmployee, day: shiftDay, date: shiftDate, start, end, role: shiftRole, startsAt, endsAt };
    setFormError(undefined);
    const message = await addShift(input);
    if (message) {
      setFormError(message);
      return;
    }
    setModalOpen(false);
  };

  const openForDay = (index: number) => {
    const day = days[index];
    setShiftDay(day.fullName);
    setShiftDate(day.label);
    setShiftDateIso(day.dateIso);
    setSelectedEmployee((current) => activeEmployees.some((employee) => employee.id === current) ? current : activeEmployees[0]?.id ?? '');
    setFormError(undefined);
    setModalOpen(true);
  };

  return (
    <View>
      <PageTitle
        eyebrow={`${days[0].label.toUpperCase()}–${days[6].label.toUpperCase()}`}
        title={role === 'manager' ? 'Team schedule' : 'My schedule'}
        subtitle={role === 'manager' ? 'Plan coverage, spot conflicts, and publish when you’re ready.' : 'Your confirmed shifts and total scheduled hours.'}
        action={role === 'manager' && !mobile ? <View style={styles.titleActions}><Button label="Add shift" icon="add" variant="secondary" onPress={() => openForDay(selectedDay)} /><Button label={unpublishedCount === 0 ? 'Published' : `Publish ${unpublishedCount} drafts`} icon={unpublishedCount === 0 ? 'checkmark' : 'send-outline'} onPress={publishSchedule} /></View> : undefined}
      />
      <Card style={styles.calendarCard}>
        {dataError ? <View style={styles.message}><Text style={styles.errorTitle}>Schedule data couldn’t load</Text><Text style={styles.messageCopy}>{dataError}</Text><Pressable onPress={() => { void refreshLiveData(); }}><Text style={styles.retry}>Try again</Text></Pressable></View> : null}
        {dataLoading ? <View style={styles.message}><ActivityIndicator color={colors.forest} /><Text style={styles.messageCopy}>Loading the schedule…</Text></View> : null}
        {!dataLoading && !dataError ? <>
        <View style={styles.scheduleToolbar}>
          <Pressable style={styles.weekButton}><Ionicons name="chevron-back" size={18} color={colors.ink} /></Pressable>
          <Text style={styles.weekTitle}>This week</Text>
          <Pressable style={styles.weekButton}><Ionicons name="chevron-forward" size={18} color={colors.ink} /></Pressable>
          <View style={styles.toolbarSpacer} />
          <StatusPill label={`${visibleShifts.length} shifts`} tone="gray" />
        </View>
        {mobile ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
              {days.map((day, index) => (
                <Pressable key={day.date} onPress={() => setSelectedDay(index)} style={[styles.dayChip, selectedDay === index && styles.dayChipActive]}>
                  <Text style={[styles.dayName, selectedDay === index && styles.dayTextActive]}>{day.name}</Text><Text style={[styles.dayDate, selectedDay === index && styles.dayTextActive]}>{day.date}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.mobileShifts}>
              {visibleShifts.filter((shift) => shift.date === days[selectedDay].label).map((shift) => <ShiftRow key={shift.id} shift={shift} employees={employees} />)}
              {visibleShifts.filter((shift) => shift.date === days[selectedDay].label).length === 0 ? <Text style={styles.noShifts}>No shifts scheduled for this day.</Text> : null}
            </View>
          </>
        ) : (
          <View style={styles.weekGrid}>
            {days.map((day, index) => (
              <View key={day.date} style={[styles.dayColumn, index > 0 && styles.leftBorder]}>
                <View style={[styles.dayHeader, index === 0 && styles.todayHeader]}><Text style={styles.dayName}>{day.name}</Text><Text style={[styles.dayDate, index === 0 && styles.todayDate]}>{day.date}</Text></View>
                <View style={styles.dayBody}>
                  {visibleShifts.filter((shift) => shift.date === day.label).map((shift) => {
                    const employee = employees.find((item) => item.id === shift.employeeId);
                    return (
                      <View key={shift.id} style={[styles.shiftBlock, !shift.published && styles.draftBlock]}>
                        <Avatar initials={employee?.initials ?? 'TT'} color={employee?.color ?? colors.forest} size={28} />
                        <Text style={styles.shiftName} numberOfLines={1}>{employee?.name.split(' ')[0] ?? 'Team member'}</Text>
                        <Text style={styles.shiftTime}>{shift.start.replace(':00', '')}–{shift.end.replace(':00', '')}</Text>
                        {!shift.published ? <Text style={styles.draft}>DRAFT</Text> : null}
                      </View>
                    );
                  })}
                  {role === 'manager' ? <Pressable onPress={() => openForDay(index)} style={styles.addShift}><Ionicons name="add" size={17} color={colors.muted} /><Text style={styles.addText}>Add shift</Text></Pressable> : null}
                </View>
              </View>
            ))}
          </View>
        )}</> : null}
      </Card>
      <View style={styles.summaryBar}>
        <Text style={styles.summaryLabel}>Scheduled labor</Text><Text style={styles.summaryValue}>{scheduledHours.toFixed(1)} hours</Text>
        <View style={styles.summaryDivider} /><Text style={styles.summaryLabel}>Draft shifts</Text><Text style={styles.summaryValue}>{unpublishedCount}</Text>
        {role === 'manager' && mobile ? <View style={styles.mobilePublish}><Button label="Add shift" compact variant="secondary" onPress={() => openForDay(selectedDay)} /><Button label={unpublishedCount === 0 ? 'Published' : 'Publish'} compact onPress={publishSchedule} /></View> : null}
      </View>
      <FormModal visible={modalOpen} title="Create a shift" subtitle="Add a team member to the schedule. New shifts remain drafts until published." submitLabel="Create shift" canSubmit={Boolean(selectedEmployee && shiftDate && start && end && shiftRole)} onClose={() => setModalOpen(false)} onSubmit={submitShift}>
        <ChoiceField label="Employee" value={selectedEmployee} onChange={setSelectedEmployee} options={activeEmployees.map((employee) => ({ label: employee.name, value: employee.id }))} />
        <ChoiceField label="Day" value={shiftDay} onChange={(value) => { const match = days.find((day) => day.fullName === value); if (match) { setShiftDay(match.fullName); setShiftDate(match.label); setShiftDateIso(match.dateIso); } }} options={days.map((day) => ({ label: `${day.name} ${day.date}`, value: day.fullName }))} />
        <View style={styles.formRow}><View style={styles.formField}><FormField label="Start time" value={start} placeholder="4:00 PM" onChangeText={setStart} /></View><View style={styles.formField}><FormField label="End time" value={end} placeholder="10:00 PM" onChangeText={setEnd} /></View></View>
        <FormField label="Position" value={shiftRole} placeholder="Server" onChangeText={setShiftRole} />
        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      </FormModal>
    </View>
  );
}

function ShiftRow({ shift, employees }: { shift: Shift; employees: Employee[] }) {
  const employee = employees.find((item) => item.id === shift.employeeId);
  return (
    <View style={styles.listShift}>
      <Avatar initials={employee?.initials ?? 'TT'} color={employee?.color ?? colors.forest} />
      <View style={styles.listCopy}><Text style={styles.listName}>{employee?.name ?? 'Team member'}</Text><Text style={styles.listRole}>{shift.role}</Text></View>
      <View><Text style={styles.listTime}>{shift.start}</Text><Text style={styles.listEnd}>to {shift.end}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: { padding: 0, overflow: 'hidden' }, scheduleToolbar: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  titleActions: { flexDirection: 'row', gap: 8 },
  weekButton: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, weekTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', marginHorizontal: 4 }, toolbarSpacer: { flex: 1 },
  weekGrid: { minHeight: 430, flexDirection: 'row' }, dayColumn: { flex: 1, minWidth: 92 }, leftBorder: { borderLeftWidth: 1, borderLeftColor: colors.border },
  dayHeader: { height: 68, alignItems: 'center', justifyContent: 'center', gap: 3, borderBottomWidth: 1, borderBottomColor: colors.border }, todayHeader: { backgroundColor: colors.mint },
  dayName: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }, dayDate: { color: colors.ink, fontSize: 18, fontWeight: '800' }, todayDate: { color: colors.forest },
  dayBody: { padding: 8, gap: 8 }, shiftBlock: { minHeight: 86, padding: 9, backgroundColor: colors.mint, borderLeftWidth: 3, borderLeftColor: colors.forest, borderRadius: 9 }, draftBlock: { backgroundColor: colors.orangeSoft, borderLeftColor: colors.orange },
  shiftName: { color: colors.ink, fontSize: 11, fontWeight: '800', marginTop: 6 }, shiftTime: { color: colors.muted, fontSize: 9, marginTop: 3 }, draft: { color: colors.orange, fontSize: 7, fontWeight: '900', marginTop: 5, letterSpacing: 0.8 },
  addShift: { height: 38, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 }, addText: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  dayStrip: { gap: 8, padding: 14 }, dayChip: { width: 54, height: 66, borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 }, dayChipActive: { backgroundColor: colors.forest, borderColor: colors.forest }, dayTextActive: { color: colors.surface },
  mobileShifts: { paddingHorizontal: 15, paddingBottom: 15 }, listShift: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 72, borderTopWidth: 1, borderTopColor: colors.border }, listCopy: { flex: 1 }, listName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, listRole: { color: colors.muted, fontSize: 11, marginTop: 3 }, listTime: { color: colors.ink, fontSize: 12, fontWeight: '700', textAlign: 'right' }, listEnd: { color: colors.muted, fontSize: 10, marginTop: 3, textAlign: 'right' },
  noShifts: { color: colors.muted, fontSize: 12, textAlign: 'center', paddingVertical: 28 },
  message: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 }, errorTitle: { color: colors.red, fontWeight: '800' }, messageCopy: { color: colors.muted, fontSize: 12, textAlign: 'center' }, retry: { color: colors.forest, fontSize: 12, fontWeight: '800', marginTop: 5 },
  summaryBar: { marginTop: 14, padding: 16, borderRadius: 13, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' }, summaryLabel: { color: '#9BA8A2', fontSize: 11 }, summaryValue: { color: colors.surface, fontSize: 13, fontWeight: '800' }, summaryDivider: { width: 1, height: 18, backgroundColor: '#3B4541', marginHorizontal: 8 }, mobilePublish: { marginLeft: 'auto', flexDirection: 'row', gap: 6 },
  formRow: { flexDirection: 'row', gap: 12 }, formField: { flex: 1 }, formError: { color: colors.red, fontSize: 12, fontWeight: '700' },
});
