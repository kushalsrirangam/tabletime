import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FormField, FormModal } from '../components/FormModal';
import { Avatar, Button, Card, PageTitle, StatusPill } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
import { StaffRequest } from '../types';

type Filter = 'All' | 'Pending' | 'Resolved';

function dateFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return parsed.getUTCFullYear() === Number(year) && parsed.getUTCMonth() === Number(month) - 1 && parsed.getUTCDate() === Number(day);
}

function toneForStatus(status: StaffRequest['status']): 'orange' | 'green' | 'red' | 'gray' {
  if (status === 'pending') return 'orange';
  if (status === 'approved') return 'green';
  if (status === 'cancelled') return 'gray';
  return 'red';
}

export function RequestsScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const { role, currentEmployeeId, employees, requests, dataLoading, dataError, refreshLiveData, resolveRequest, addTimeOffRequest } = useApp();
  const [filter, setFilter] = useState<Filter>('All');
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [startsOn, setStartsOn] = useState(() => dateFromToday(1));
  const [endsOn, setEndsOn] = useState(() => dateFromToday(1));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState<string>();
  const [requestError, setRequestError] = useState<string>();
  const employeesById = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees]);
  const visible = useMemo(() => requests
    .filter((request) => filter === 'All' || (filter === 'Pending' ? request.status === 'pending' : request.status !== 'pending'))
    .filter((request) => role === 'manager' || request.employeeId === currentEmployeeId), [currentEmployeeId, filter, requests, role]);
  const datesValid = isValidIsoDate(startsOn) && isValidIsoDate(endsOn) && endsOn >= startsOn;
  const visibleError = requestError ?? dataError;

  const submit = async () => {
    if (!datesValid || submitting) return;
    setSubmitting(true);
    setRequestError(undefined);
    try {
      await addTimeOffRequest({ startsOn, endsOn, reason: reason.trim() });
      setSubmitted(true);
      setReason('');
      setModalOpen(false);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'The request could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const review = async (id: string, decision: 'approved' | 'declined') => {
    if (resolvingId) return;
    setResolvingId(id);
    setRequestError(undefined);
    try {
      await resolveRequest(id, decision);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'The request could not be reviewed.');
    } finally {
      setResolvingId(undefined);
    }
  };

  return (
    <View>
      <PageTitle eyebrow={role === 'manager' ? 'APPROVAL CENTER' : 'MY REQUESTS'} title="Requests" subtitle={role === 'manager' ? 'Review time off, shift changes, and attendance corrections.' : 'Submit and track requests to your manager.'} action={!compact && role === 'employee' ? <Button label={submitted ? 'Submit another' : 'Request time off'} icon="add" onPress={() => setModalOpen(true)} /> : undefined} />
      {visibleError ? <View accessibilityRole="alert" style={styles.errorBanner}><Text style={styles.errorText}>{visibleError}</Text><Button label="Retry" compact variant="secondary" onPress={() => { setRequestError(undefined); void refreshLiveData(); }} /></View> : null}
      <View style={styles.filters}>
        {(['All', 'Pending', 'Resolved'] as Filter[]).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}
      </View>
      <Card style={styles.listCard}>
        {visible.length === 0 ? (
          <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={dataLoading ? 'sync-outline' : 'file-tray-outline'} size={25} color={colors.forest} /></View><Text style={styles.emptyTitle}>{dataLoading ? 'Loading requests…' : 'Nothing here yet'}</Text><Text style={styles.emptyCopy}>{role === 'employee' ? 'Your submitted requests will appear here.' : 'No requests match this filter.'}</Text></View>
        ) : visible.map((request) => {
          const employee = employeesById.get(request.employeeId);
          return (
            <View key={request.id} style={[styles.requestRow, compact && styles.requestStack]}>
              <Avatar initials={employee?.initials ?? 'TT'} color={employee?.color ?? colors.forest} />
              <View style={styles.requestCopy}>
                <View style={styles.titleRow}><Text style={styles.requestType}>{request.type}</Text><StatusPill label={request.status[0].toUpperCase() + request.status.slice(1)} tone={toneForStatus(request.status)} /></View>
                <Text style={styles.employee}>{employee?.name ?? 'Team member'}</Text><Text style={styles.detail}>{request.detail} · {request.createdAt}</Text>
              </View>
              {role === 'manager' && request.status === 'pending' ? (
                <View style={styles.actions}><Button label="Decline" compact variant="secondary" disabled={Boolean(resolvingId)} loading={resolvingId === request.id} onPress={() => void review(request.id, 'declined')} /><Button label="Approve" compact disabled={Boolean(resolvingId)} loading={resolvingId === request.id} onPress={() => void review(request.id, 'approved')} /></View>
              ) : null}
            </View>
          );
        })}
      </Card>
      {compact && role === 'employee' ? <View style={styles.mobileAction}><Button label={submitted ? 'Submit another' : 'Request time off'} icon="add" onPress={() => setModalOpen(true)} /></View> : null}
      <FormModal visible={modalOpen} title="Request time off" subtitle="Use YYYY-MM-DD dates. Your manager can approve or decline after submission." submitLabel="Submit request" submitting={submitting} canSubmit={datesValid && reason.length <= 1000} onClose={() => { if (!submitting) setModalOpen(false); }} onSubmit={() => void submit()}>
        <FormField label="Start date" value={startsOn} placeholder="2026-08-23" onChangeText={setStartsOn} autoCapitalize="none" />
        <FormField label="End date" value={endsOn} placeholder="2026-08-23" onChangeText={setEndsOn} autoCapitalize="none" />
        <FormField label="Reason or note" value={reason} placeholder="Optional note for your manager" onChangeText={setReason} multiline />
        {!datesValid ? <Text accessibilityRole="alert" style={styles.validationText}>Enter valid dates and make sure the end date is not before the start date.</Text> : null}
        {reason.length > 1000 ? <Text accessibilityRole="alert" style={styles.validationText}>The note must be 1,000 characters or fewer.</Text> : null}
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBanner: { marginBottom: 14, padding: 12, borderWidth: 1, borderColor: colors.red, borderRadius: 11, backgroundColor: colors.redSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }, errorText: { flex: 1, color: colors.red, fontSize: 12, lineHeight: 18, fontWeight: '700' }, validationText: { color: colors.red, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  filters: { flexDirection: 'row', gap: 5, marginBottom: 14 }, filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 }, filterActive: { backgroundColor: colors.ink }, filterText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, filterTextActive: { color: colors.surface },
  listCard: { paddingVertical: 4 }, requestRow: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border }, requestStack: { alignItems: 'flex-start', flexWrap: 'wrap' }, requestCopy: { flex: 1, minWidth: 190 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, requestType: { color: colors.ink, fontSize: 14, fontWeight: '800' }, employee: { color: colors.ink, fontSize: 11, fontWeight: '700', marginTop: 6 }, detail: { color: colors.muted, fontSize: 11, marginTop: 3 }, actions: { flexDirection: 'row', gap: 7 },
  empty: { paddingVertical: 60, alignItems: 'center' }, emptyIcon: { width: 50, height: 50, backgroundColor: colors.mint, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: colors.ink, fontWeight: '800', marginTop: 13 }, emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 5 }, mobileAction: { marginTop: 14 },
});
