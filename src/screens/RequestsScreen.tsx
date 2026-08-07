import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FormField, FormModal } from '../components/FormModal';
import { Avatar, Button, Card, PageTitle, StatusPill } from '../components/UI';
import { useApp } from '../context/AppContext';
import { employees } from '../data';
import { colors } from '../theme';

type Filter = 'All' | 'Pending' | 'Resolved';

export function RequestsScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const { role, requests, resolveRequest, addTimeOffRequest } = useApp();
  const [filter, setFilter] = useState<Filter>('All');
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState('Aug 21');
  const [reason, setReason] = useState('Personal day');
  const visible = requests.filter((request) => filter === 'All' || (filter === 'Pending' ? request.status === 'pending' : request.status !== 'pending')).filter((request) => role === 'manager' || request.employeeId === 'e1');

  const submit = () => {
    addTimeOffRequest({ date: date.trim(), reason: reason.trim() });
    setSubmitted(true);
    setModalOpen(false);
  };
  return (
    <View>
      <PageTitle eyebrow={role === 'manager' ? 'APPROVAL CENTER' : 'MY REQUESTS'} title="Requests" subtitle={role === 'manager' ? 'Review time off, shift changes, and attendance corrections.' : 'Submit and track requests to your manager.'} action={!compact && role === 'employee' ? <Button label={submitted ? 'Submit another' : 'Request time off'} icon="add" onPress={() => setModalOpen(true)} /> : undefined} />
      <View style={styles.filters}>
        {(['All', 'Pending', 'Resolved'] as Filter[]).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}
      </View>
      <Card style={styles.listCard}>
        {visible.length === 0 ? (
          <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="file-tray-outline" size={25} color={colors.forest} /></View><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.emptyCopy}>{role === 'employee' ? 'Your submitted requests will appear here.' : 'No requests match this filter.'}</Text></View>
        ) : visible.map((request) => {
          const employee = employees.find((item) => item.id === request.employeeId)!;
          return (
            <View key={request.id} style={[styles.requestRow, compact && styles.requestStack]}>
              <Avatar initials={employee.initials} color={employee.color} />
              <View style={styles.requestCopy}>
                <View style={styles.titleRow}><Text style={styles.requestType}>{request.type}</Text><StatusPill label={request.status[0].toUpperCase() + request.status.slice(1)} tone={request.status === 'pending' ? 'orange' : request.status === 'approved' ? 'green' : 'red'} /></View>
                <Text style={styles.employee}>{employee.name}</Text><Text style={styles.detail}>{request.detail} · {request.createdAt}</Text>
              </View>
              {role === 'manager' && request.status === 'pending' ? (
                <View style={styles.actions}><Button label="Decline" compact variant="secondary" onPress={() => resolveRequest(request.id, 'declined')} /><Button label="Approve" compact onPress={() => resolveRequest(request.id, 'approved')} /></View>
              ) : null}
            </View>
          );
        })}
      </Card>
      {compact && role === 'employee' ? <View style={styles.mobileAction}><Button label={submitted ? 'Submit another' : 'Request time off'} icon="add" onPress={() => setModalOpen(true)} /></View> : null}
      <FormModal visible={modalOpen} title="Request time off" subtitle="Your manager will be notified and can approve or decline this request." submitLabel="Submit request" canSubmit={Boolean(date.trim())} onClose={() => setModalOpen(false)} onSubmit={submit}>
        <FormField label="Date or date range" value={date} placeholder="Aug 21 or Aug 21–23" onChangeText={setDate} />
        <FormField label="Reason or note" value={reason} placeholder="Optional note for your manager" onChangeText={setReason} multiline />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 5, marginBottom: 14 }, filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 }, filterActive: { backgroundColor: colors.ink }, filterText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, filterTextActive: { color: colors.surface },
  listCard: { paddingVertical: 4 }, requestRow: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border }, requestStack: { alignItems: 'flex-start', flexWrap: 'wrap' }, requestCopy: { flex: 1, minWidth: 190 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, requestType: { color: colors.ink, fontSize: 14, fontWeight: '800' }, employee: { color: colors.ink, fontSize: 11, fontWeight: '700', marginTop: 6 }, detail: { color: colors.muted, fontSize: 11, marginTop: 3 }, actions: { flexDirection: 'row', gap: 7 },
  empty: { paddingVertical: 60, alignItems: 'center' }, emptyIcon: { width: 50, height: 50, backgroundColor: colors.mint, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: colors.ink, fontWeight: '800', marginTop: 13 }, emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 5 }, mobileAction: { marginTop: 14 },
});
