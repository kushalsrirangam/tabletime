import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button, Card, PageTitle, SectionHeader, StatusPill } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

function elapsed(start: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - new Date(start).getTime()) / 1000));
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ClockScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const {
    activeEntry,
    onBreak,
    clockIn,
    clockOut,
    toggleBreak,
    clockEntries,
    liveClockEnabled,
    clockActionLoading,
    clockActionError,
    dataLoading,
    dataError,
    refreshLiveData,
  } = useApp();
  const { workspace } = useAuth();
  const [now, setNow] = useState(Date.now());
  const timeZone = workspace?.locationTimezone ?? workspace?.organizationTimezone;
  const locationName = workspace?.locationName ?? 'your restaurant';
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);

  const handleClockAction = () => {
    void (activeEntry ? clockOut() : clockIn());
  };

  return (
    <View>
      <PageTitle
        eyebrow="TIME & ATTENDANCE"
        title="Time clock"
        subtitle={liveClockEnabled ? 'Clock punches sync securely with your restaurant workspace.' : 'Demo punches are saved on this device.'}
      />
      <View style={[styles.layout, compact && styles.stack]}>
        <Card style={styles.hero}>
          <View style={[styles.liveMark, !activeEntry && styles.offMark]}><View style={[styles.liveDot, !activeEntry && styles.offDot]} /><Text style={[styles.liveText, !activeEntry && styles.offText]}>{activeEntry ? (onBreak ? 'ON BREAK' : 'ON SHIFT') : 'OFF SHIFT'}</Text></View>
          <Text style={styles.time}>{activeEntry ? elapsed(activeEntry.clockIn, now) : new Date(now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}</Text>
          <Text style={styles.date}>{new Date(now).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', timeZone })}</Text>
          {activeEntry ? <Text style={styles.started}>Clocked in at {new Date(activeEntry.clockIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}</Text> : <Text style={styles.started}>Ready to start your shift</Text>}
          <View style={[styles.actions, compact && styles.stackActions]}>
            {activeEntry && !liveClockEnabled ? <Button label={onBreak ? 'End break' : 'Start break'} icon="cafe-outline" variant="secondary" onPress={toggleBreak} /> : null}
            <Button
              label={clockActionLoading ? (activeEntry ? 'Clocking out…' : 'Clocking in…') : activeEntry ? 'Clock out' : 'Clock in'}
              icon={activeEntry ? 'stop-circle-outline' : 'play-circle-outline'}
              variant={activeEntry ? 'danger' : 'primary'}
              loading={clockActionLoading}
              disabled={clockActionLoading || (liveClockEnabled && dataLoading)}
              onPress={handleClockAction}
            />
          </View>
          {clockActionError ? <Text accessibilityRole="alert" style={styles.actionError}>{clockActionError}</Text> : null}
          <View style={styles.verified}>
            <Ionicons name={liveClockEnabled ? 'cloud-done-outline' : 'phone-portrait-outline'} size={14} color={colors.forest} />
            <Text style={styles.verifiedText}>{liveClockEnabled ? `Punches sync to ${locationName}` : 'Demo mode · stored on this device'}</Text>
          </View>
        </Card>
        <Card style={styles.history}>
          <SectionHeader title="Recent activity" />
          {dataError && liveClockEnabled ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={25} color={colors.red} />
              <Text style={styles.emptyTitle}>Could not load punches</Text>
              <Text accessibilityRole="alert" style={styles.emptyCopy}>{dataError}</Text>
              <Button label="Try again" icon="refresh-outline" variant="secondary" compact loading={dataLoading} onPress={() => { void refreshLiveData(); }} />
            </View>
          ) : dataLoading && liveClockEnabled && clockEntries.length === 0 ? (
            <View style={styles.empty}><ActivityIndicator color={colors.forest} /><Text style={styles.emptyCopy}>Loading your punches…</Text></View>
          ) : clockEntries.length === 0 ? (
            <View style={styles.empty}><Ionicons name="time-outline" size={25} color={colors.muted} /><Text style={styles.emptyTitle}>No punches yet</Text><Text style={styles.emptyCopy}>Your time entries will appear here.</Text></View>
          ) : clockEntries.slice().reverse().slice(0, 5).map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <View style={styles.entryIcon}><Ionicons name={entry.clockOut ? 'checkmark' : 'play'} size={14} color={colors.forest} /></View>
              <View style={styles.entryCopy}><Text style={styles.entryDay}>{new Date(entry.clockIn).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', timeZone })}</Text><Text style={styles.entryTime}>{new Date(entry.clockIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })} – {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone }) : 'Now'}</Text></View>
              <StatusPill label={entry.clockOut ? 'Complete' : 'Open'} tone={entry.clockOut ? 'gray' : 'green'} />
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { flexDirection: 'row', alignItems: 'stretch', gap: 16 }, stack: { flexDirection: 'column' },
  hero: { flex: 1.15, minHeight: 430, alignItems: 'center', justifyContent: 'center', padding: 28 }, history: { flex: 0.85, minHeight: 430 },
  liveMark: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.mint, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99 }, offMark: { backgroundColor: colors.surfaceSoft },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.forest }, offDot: { backgroundColor: colors.muted }, liveText: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1 }, offText: { color: colors.muted },
  time: { color: colors.ink, fontSize: 48, fontWeight: '800', letterSpacing: -2, marginTop: 25 }, date: { color: colors.muted, fontSize: 14, marginTop: 6 }, started: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 27 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 }, stackActions: { flexDirection: 'column', width: '100%' }, verified: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 28 }, verifiedText: { color: colors.muted, fontSize: 11 },
  actionError: { color: colors.red, backgroundColor: colors.redSoft, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9, marginTop: 14, maxWidth: 420, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9 }, emptyTitle: { color: colors.ink, fontWeight: '800' }, emptyCopy: { color: colors.muted, fontSize: 12, maxWidth: 300, textAlign: 'center', lineHeight: 17 },
  entry: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border }, entryIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, entryCopy: { flex: 1 }, entryDay: { color: colors.ink, fontSize: 12, fontWeight: '800' }, entryTime: { color: colors.muted, fontSize: 10, marginTop: 4 },
});
