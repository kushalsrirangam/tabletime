import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { employees as initialEmployees, initialRequests, shifts as initialShifts } from '../data';
import { supabase } from '../lib/supabase';
import { ClockEntry, Employee, NewShiftInput, NewTimeOffInput, Shift, StaffRequest, UserRole } from '../types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@tabletime/state-v1';

type StoredState = {
  clockEntries: ClockEntry[];
  onBreak: boolean;
  requests: StaffRequest[];
  shifts: Shift[];
};

type AppContextValue = StoredState & {
  hydrated: boolean;
  dataLoading: boolean;
  dataError?: string;
  employees: Employee[];
  role: UserRole;
  activeEntry?: ClockEntry;
  setRole: (role: UserRole) => void;
  clockIn: () => void;
  clockOut: () => void;
  toggleBreak: () => void;
  resolveRequest: (id: string, status: 'approved' | 'declined') => void;
  addTimeOffRequest: (input: NewTimeOffInput) => void;
  addShift: (input: NewShiftInput) => Promise<string | undefined>;
  publishSchedule: () => Promise<void>;
  refreshLiveData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const employeeColors = ['#286B50', '#D8793D', '#497B9B', '#9C6AA2', '#A56B47', '#617C52'];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TT';
}

function formatDateTime(value: string, timeZone: string) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(date),
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone }).format(date),
    time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(date),
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const { backendConfigured, session, workspace } = useAuth();
  const [demoRole, setDemoRole] = useState<UserRole>('manager');
  const [hydrated, setHydrated] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string>();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [clockEntries, setClockEntries] = useState<ClockEntry[]>([]);
  const [onBreak, setOnBreak] = useState(false);
  const [requests, setRequests] = useState<StaffRequest[]>(initialRequests);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const role: UserRole = backendConfigured && workspace ? (workspace.role === 'employee' ? 'employee' : 'manager') : demoRole;

  useEffect(() => {
    if (backendConfigured) {
      setHydrated(true);
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as StoredState;
        setClockEntries(saved.clockEntries ?? []);
        setOnBreak(saved.onBreak ?? false);
        setRequests(saved.requests ?? initialRequests);
        setShifts(saved.shifts ?? initialShifts);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [backendConfigured]);

  useEffect(() => {
    if (!hydrated || backendConfigured) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ clockEntries, onBreak, requests, shifts })).catch(() => undefined);
  }, [backendConfigured, clockEntries, hydrated, onBreak, requests, shifts]);

  const refreshLiveData = useCallback(async () => {
    if (!backendConfigured || !workspace || !supabase) {
      setDataLoading(false);
      setDataError(undefined);
      return;
    }

    setDataLoading(true);
    setDataError(undefined);
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - 1);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 9);
    const timeRangeStart = new Date();
    timeRangeStart.setDate(timeRangeStart.getDate() - 7);

    const [employeeResult, shiftResult, timeResult] = await Promise.all([
      supabase.from('employees').select('id, full_name, email, job_title, employment_status').eq('organization_id', workspace.organizationId).neq('employment_status', 'inactive').order('full_name'),
      supabase.from('shifts').select('id, employee_id, starts_at, ends_at, position, status').eq('organization_id', workspace.organizationId).neq('status', 'cancelled').gte('starts_at', rangeStart.toISOString()).lt('starts_at', rangeEnd.toISOString()).order('starts_at'),
      supabase.from('time_entries').select('employee_id, clocked_in_at, clocked_out_at').eq('organization_id', workspace.organizationId).gte('clocked_in_at', timeRangeStart.toISOString()),
    ]);

    const error = employeeResult.error ?? shiftResult.error ?? timeResult.error;
    if (error) {
      setDataError(error.message);
      setDataLoading(false);
      return;
    }

    const hoursByEmployee = new Map<string, number>();
    const workingEmployees = new Set<string>();
    for (const entry of timeResult.data ?? []) {
      const end = entry.clocked_out_at ? new Date(entry.clocked_out_at).getTime() : Date.now();
      const hours = Math.max(0, end - new Date(entry.clocked_in_at).getTime()) / 3_600_000;
      hoursByEmployee.set(entry.employee_id, (hoursByEmployee.get(entry.employee_id) ?? 0) + hours);
      if (!entry.clocked_out_at) workingEmployees.add(entry.employee_id);
    }

    setEmployees((employeeResult.data ?? []).map((employee, index) => ({
      id: employee.id,
      name: employee.full_name,
      email: employee.email ?? undefined,
      initials: initialsFor(employee.full_name),
      role: employee.job_title,
      color: employeeColors[index % employeeColors.length],
      status: workingEmployees.has(employee.id) ? 'clocked-in' : 'off',
      weeklyHours: Math.round((hoursByEmployee.get(employee.id) ?? 0) * 10) / 10,
    })));

    setShifts((shiftResult.data ?? []).map((shift) => {
      const starts = formatDateTime(shift.starts_at, workspace.organizationTimezone);
      const ends = formatDateTime(shift.ends_at, workspace.organizationTimezone);
      return {
        id: shift.id,
        employeeId: shift.employee_id,
        day: starts.day,
        date: starts.date,
        start: starts.time,
        end: ends.time,
        role: shift.position,
        published: shift.status === 'published',
        startsAt: shift.starts_at,
        endsAt: shift.ends_at,
      };
    }));
    setDataLoading(false);
  }, [backendConfigured, workspace]);

  useEffect(() => {
    void refreshLiveData();
  }, [refreshLiveData]);

  const activeEntry = useMemo(
    () => clockEntries.find((entry) => entry.employeeId === 'e1' && !entry.clockOut),
    [clockEntries],
  );

  const clockIn = useCallback(() => {
    setClockEntries((current) => {
      if (current.some((entry) => entry.employeeId === 'e1' && !entry.clockOut)) return current;
      return [...current, { id: `entry-${Date.now()}`, employeeId: 'e1', clockIn: new Date().toISOString(), breakMinutes: 0 }];
    });
  }, []);

  const clockOut = useCallback(() => {
    setClockEntries((current) => current.map((entry) => (
      entry.employeeId === 'e1' && !entry.clockOut ? { ...entry, clockOut: new Date().toISOString() } : entry
    )));
    setOnBreak(false);
  }, []);

  const toggleBreak = useCallback(() => {
    if (activeEntry) setOnBreak((current) => !current);
  }, [activeEntry]);

  const resolveRequest = useCallback((id: string, status: 'approved' | 'declined') => {
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
  }, []);

  const addTimeOffRequest = useCallback((input: NewTimeOffInput) => {
    setRequests((current) => [{
      id: `request-${Date.now()}`,
      employeeId: 'e1',
      type: 'Time off',
      detail: `${input.date} · ${input.reason || 'All day'}`,
      createdAt: 'Just now',
      status: 'pending',
    }, ...current]);
  }, []);

  const addShift = useCallback(async (input: NewShiftInput) => {
    if (backendConfigured) {
      if (!supabase || !session || !workspace?.locationId || !input.startsAt || !input.endsAt) {
        const message = 'A restaurant location and valid shift times are required.';
        setDataError(message);
        return message;
      }
      const { error } = await supabase.from('shifts').insert({
        organization_id: workspace.organizationId,
        location_id: workspace.locationId,
        employee_id: input.employeeId,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        position: input.role,
        status: 'draft',
        created_by: session.user.id,
      });
      if (error) {
        setDataError(error.message);
        return error.message;
      }
      await refreshLiveData();
      return;
    }
    setShifts((current) => [...current, { id: `shift-${Date.now()}`, ...input, published: false }]);
  }, [backendConfigured, refreshLiveData, session, workspace]);

  const publishSchedule = useCallback(async () => {
    if (backendConfigured) {
      if (!supabase || !workspace) return;
      const { error } = await supabase.from('shifts').update({ status: 'published' }).eq('organization_id', workspace.organizationId).eq('status', 'draft');
      if (error) {
        setDataError(error.message);
        return;
      }
      await refreshLiveData();
      return;
    }
    setShifts((current) => current.map((shift) => ({ ...shift, published: true })));
  }, [backendConfigured, refreshLiveData, workspace]);

  const value = useMemo(() => ({
    hydrated, dataLoading, dataError, employees, role, setRole: setDemoRole, clockEntries, activeEntry, onBreak, requests, shifts,
    clockIn, clockOut, toggleBreak, resolveRequest, addTimeOffRequest, addShift, publishSchedule, refreshLiveData,
  }), [activeEntry, addShift, addTimeOffRequest, clockEntries, clockIn, clockOut, dataError, dataLoading, employees, hydrated, onBreak, publishSchedule, refreshLiveData, requests, resolveRequest, role, shifts, toggleBreak]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
