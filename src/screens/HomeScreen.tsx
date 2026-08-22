import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { TabKey } from '../types';
import { Avatar, Button, Card, PageTitle, SectionHeader, sharedStyles, StatusPill } from '../components/UI';

function formatElapsed(startedAt: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

export function HomeScreen({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const { role, activeEntry, onBreak, clockIn, clockOut, clockActionLoading, clockActionError, breakActionLoading, breakActionError, requests, shifts, employees } = useApp();
  const { workspace } = useAuth();
  const [now, setNow] = useState(Date.now());
  const firstName = workspace?.fullName.split(/\s+/)[0] ?? 'Jordan';
  const restaurantName = workspace?.organizationName ?? 'The Juniper Room';
  const timeZone = workspace?.locationTimezone ?? workspace?.organizationTimezone;
  const currentEmployeeId = workspace?.employeeId ?? 'e1';
  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: workspace?.organizationTimezone }).format(new Date()).toUpperCase();

  useEffect(() => {
    if (!activeEntry) return;
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  const activeEmployees = employees.filter((employee) => employee.employmentStatus === 'active');
  const working = activeEmployees.filter((employee) => employee.status !== 'off');
  const pending = requests.filter((request) => request.status === 'pending');
  const laborHours = activeEmployees.reduce((sum, employee) => sum + employee.weeklyHours, 0);

  return (
    <View>
      <PageTitle
        eyebrow={role === 'manager' ? todayLabel : 'WELCOME BACK'}
        title={role === 'manager' ? `Good morning, ${firstName}` : 'Your workday at a glance'}
        subtitle={role === 'manager' ? `Here’s what’s happening at ${restaurantName} today.` : 'Clock in, check your next shift, and stay up to date.'}
        action={!compact ? <Button label="View schedule" icon="calendar-outline" variant="secondary" onPress={() => onNavigate('schedule')} /> : undefined}
      />

      {role === 'manager' ? (
        <>
          <View style={[styles.metrics, compact && styles.stack]}>
            <Metric icon="people" label="On the floor" value={`${working.length}`} detail={`of ${activeEmployees.length} active`} tone="green" />
            <Metric icon="time" label="Labor, last 7 days" value={`${laborHours}h`} detail="Recorded time" tone="blue" />
            <Metric icon="alert-circle" label="Needs attention" value={`${pending.length}`} detail="pending requests" tone="orange" />
          </View>
          <View style={[styles.columns, compact && styles.stack]}>
            <Card style={styles.columnWide}>
              <SectionHeader title="Today’s floor" action="View team" onPress={() => onNavigate('team')} />
              {working.map((employee, index) => (
                <View key={employee.id} style={[styles.personRow, index > 0 && styles.withBorder]}>
                  <Avatar initials={employee.initials} color={employee.color} />
                  <View style={styles.personCopy}>
                    <Text style={styles.personName}>{employee.name}</Text>
                    <Text style={styles.personRole}>{employee.role}</Text>
                  </View>
                  <StatusPill label={employee.status === 'break' ? 'On break' : 'Working'} tone={employee.status === 'break' ? 'orange' : 'green'} />
                </View>
              ))}
            </Card>
            <View style={styles.columnNarrow}>
              <ClockCard activeEntry={activeEntry?.clockIn} onBreak={onBreak} onClockIn={clockIn} onClockOut={clockOut} onOpen={() => onNavigate('clock')} now={now} timeZone={timeZone} busy={clockActionLoading || breakActionLoading} error={breakActionError ?? clockActionError} />
              <Card>
                <SectionHeader title="Coverage" />
                <View style={styles.coverageRow}><Text style={styles.coverageTime}>5–7 PM</Text><View style={styles.coverageTrack}><View style={[styles.coverageFill, { width: '86%' }]} /></View><Text style={styles.coverageValue}>6/7</Text></View>
                <View style={styles.coverageRow}><Text style={styles.coverageTime}>7–9 PM</Text><View style={styles.coverageTrack}><View style={[styles.coverageFill, { width: '58%', backgroundColor: colors.orange }]} /></View><Text style={styles.coverageValue}>4/7</Text></View>
                <Text style={styles.coverageNote}>One server needed for the dinner rush.</Text>
              </Card>
            </View>
          </View>
        </>
      ) : (
        <View style={[styles.columns, compact && styles.stack]}>
          <ClockCard activeEntry={activeEntry?.clockIn} onBreak={onBreak} onClockIn={clockIn} onClockOut={clockOut} onOpen={() => onNavigate('clock')} now={now} timeZone={timeZone} busy={clockActionLoading || breakActionLoading} error={breakActionError ?? clockActionError} large />
          <Card style={styles.columnWide}>
            <SectionHeader title="Your next shifts" action="Full schedule" onPress={() => onNavigate('schedule')} />
            {shifts.filter((shift) => shift.employeeId === currentEmployeeId).map((shift) => (
              <View key={shift.id} style={styles.shiftRow}>
                <View style={styles.dateBox}><Text style={styles.dateMonth}>{shift.date.split(' ')[0]}</Text><Text style={styles.dateDay}>{shift.date.split(' ')[1]}</Text></View>
                <View style={styles.personCopy}><Text style={styles.personName}>{shift.day}</Text><Text style={styles.personRole}>{shift.start} – {shift.end}</Text></View>
                <StatusPill label={shift.role} tone="gray" />
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}

function Metric({ icon, label, value, detail, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; detail: string; tone: 'green' | 'orange' | 'blue' }) {
  const palette = tone === 'green' ? [colors.mint, colors.forest] : tone === 'orange' ? [colors.orangeSoft, colors.orange] : [colors.blueSoft, colors.blue];
  return (
    <Card style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: palette[0] }]}><Ionicons name={icon} size={20} color={palette[1]} /></View>
      <Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text>
    </Card>
  );
}

function ClockCard({ activeEntry, onBreak, onClockIn, onClockOut, onOpen, now, timeZone, busy, error, large }: { activeEntry?: string; onBreak: boolean; onClockIn: () => Promise<void>; onClockOut: () => Promise<void>; onOpen: () => void; now: number; timeZone?: string; busy: boolean; error?: string; large?: boolean }) {
  const elapsed = activeEntry ? formatElapsed(activeEntry, now) : 'Not clocked in';
  const handleClockAction = () => {
    void (activeEntry ? onClockOut() : onClockIn());
  };
  return (
    <Card style={[styles.clockCard, large && styles.clockCardLarge]}>
      <View style={sharedStyles.row}>
        <View style={styles.clockIcon}><Ionicons name={onBreak ? 'cafe' : 'time'} size={21} color={colors.forest} /></View>
        <View style={styles.personCopy}><Text style={styles.clockLabel}>Your shift</Text><Text style={styles.clockState}>{onBreak ? 'Break in progress' : activeEntry ? 'Clocked in' : 'Ready when you are'}</Text></View>
      </View>
      <Text style={styles.elapsed}>{elapsed}</Text>
      <Text style={styles.clockHint}>{activeEntry ? `Started ${new Date(activeEntry).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}` : 'Ready to start your shift'}</Text>
      <Button label={busy ? (activeEntry ? 'Clocking out…' : 'Clocking in…') : activeEntry ? 'Clock out' : 'Clock in'} icon={activeEntry ? 'stop-circle-outline' : 'play-circle-outline'} onPress={handleClockAction} variant={activeEntry ? 'danger' : 'primary'} loading={busy} disabled={busy} />
      {error ? <Text accessibilityRole="alert" style={styles.clockError}>{error}</Text> : null}
      <Text onPress={onOpen} style={styles.clockLink}>Open time clock</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 14, marginBottom: 16 }, stack: { flexDirection: 'column', alignItems: 'stretch' },
  metric: { flex: 1, minWidth: 0 }, metricIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  metricLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' }, metricValue: { color: colors.ink, fontSize: 27, fontWeight: '800', marginTop: 5 }, metricDetail: { color: colors.muted, fontSize: 12, marginTop: 4 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 }, columnWide: { flex: 1.45 }, columnNarrow: { flex: 0.8, gap: 16 },
  personRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 }, withBorder: { borderTopWidth: 1, borderTopColor: colors.border }, personCopy: { flex: 1 },
  personName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, personRole: { color: colors.muted, fontSize: 12, marginTop: 4 },
  clockCard: { gap: 14 }, clockCardLarge: { flex: 0.85, minHeight: 290, justifyContent: 'center' }, clockIcon: { width: 42, height: 42, backgroundColor: colors.mint, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  clockLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' }, clockState: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 3 },
  elapsed: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -1 }, clockHint: { color: colors.muted, fontSize: 12, marginTop: -8 }, clockError: { color: colors.red, backgroundColor: colors.redSoft, borderRadius: 8, padding: 9, fontSize: 10, lineHeight: 15, textAlign: 'center' }, clockLink: { color: colors.forest, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  coverageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 7 }, coverageTime: { color: colors.muted, fontSize: 11, width: 50 },
  coverageTrack: { flex: 1, height: 7, backgroundColor: colors.surfaceSoft, borderRadius: 4, overflow: 'hidden' }, coverageFill: { height: '100%', backgroundColor: colors.forest, borderRadius: 4 }, coverageValue: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  coverageNote: { color: '#9B542C', backgroundColor: colors.orangeSoft, padding: 10, borderRadius: 9, marginTop: 10, fontSize: 11, lineHeight: 16 },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
  dateBox: { width: 45, height: 48, borderRadius: 10, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }, dateMonth: { color: colors.orange, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }, dateDay: { color: colors.ink, fontSize: 16, fontWeight: '800' },
});
