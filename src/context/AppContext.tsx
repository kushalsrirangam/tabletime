import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { employees as initialEmployees, initialRequests, shifts as initialShifts } from '../data';
import { supabase } from '../lib/supabase';
import { ClockEntry, Employee, EmploymentStatus, NewShiftInput, NewTimeOffInput, SaveEmployeeInput, Shift, StaffRequest, UserRole, WorkLocation } from '../types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@tabletime/state-v1';

type StoredState = {
  clockEntries: ClockEntry[];
  onBreak: boolean;
  requests: StaffRequest[];
  shifts: Shift[];
  employees: Employee[];
};

type AppContextValue = StoredState & {
  hydrated: boolean;
  dataLoading: boolean;
  dataError?: string;
  liveClockEnabled: boolean;
  clockActionLoading: boolean;
  clockActionError?: string;
  employees: Employee[];
  locations: WorkLocation[];
  role: UserRole;
  activeEntry?: ClockEntry;
  setRole: (role: UserRole) => void;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  toggleBreak: () => void;
  resolveRequest: (id: string, status: 'approved' | 'declined') => void;
  addTimeOffRequest: (input: NewTimeOffInput) => void;
  addShift: (input: NewShiftInput) => Promise<string | undefined>;
  saveEmployee: (input: SaveEmployeeInput) => Promise<void>;
  inviteEmployee: (employeeId: string) => Promise<string>;
  publishSchedule: () => Promise<void>;
  refreshLiveData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const employeeColors = ['#286B50', '#D8793D', '#497B9B', '#9C6AA2', '#A56B47', '#617C52'];
const demoLocations: WorkLocation[] = [{ id: 'demo-main', name: 'The Juniper Room' }];

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

function clockErrorMessage(message: string, action: 'in' | 'out') {
  const normalized = message.toLowerCase();
  if (normalized.includes('no active employee record')) return 'Your employee profile is not active at this location. Ask a manager to review your assignment.';
  if (normalized.includes('no open time entry')) return 'No open shift was found. Your punches have been refreshed.';
  if (normalized.includes('one_open_time_entry') || normalized.includes('duplicate key')) return 'You are already clocked in. Your punches have been refreshed.';
  if (normalized.includes('authentication required') || normalized.includes('jwt')) return 'Your session expired. Sign in again before clocking in or out.';
  return `Clock-${action} could not be completed. ${message}`;
}

function employeeErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('employees_org_normalized_email_idx') || normalized.includes('duplicate key')) return 'An employee with that work email already exists.';
  if (normalized.includes('row-level security') || normalized.includes('permission denied')) return 'Only an owner or manager can change employee details.';
  if (normalized.includes('0 rows') || normalized.includes('json object requested')) return 'This employee could not be updated. You cannot deactivate your own connected profile.';
  if (normalized.includes('check constraint')) return 'One or more employee details are not valid. Review the form and try again.';
  return `Employee details could not be saved. ${message}`;
}

async function invitationErrorMessage(error: unknown) {
  const fallback = error instanceof Error ? error.message : 'The invitation could not be sent.';
  const context = (error as { context?: Response } | null)?.context;
  if (!context) return fallback;
  try {
    const payload = await context.clone().json() as { message?: string };
    return payload.message ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizedEmploymentStatus(value: string): EmploymentStatus {
  if (value === 'inactive' || value === 'invited') return value;
  return 'active';
}

export function AppProvider({ children }: PropsWithChildren) {
  const { backendConfigured, session, workspace } = useAuth();
  const [demoRole, setDemoRole] = useState<UserRole>('manager');
  const [hydrated, setHydrated] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string>();
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [clockActionError, setClockActionError] = useState<string>();
  const clockActionInFlight = useRef(false);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [locations, setLocations] = useState<WorkLocation[]>(demoLocations);
  const [clockEntries, setClockEntries] = useState<ClockEntry[]>([]);
  const [onBreak, setOnBreak] = useState(false);
  const [requests, setRequests] = useState<StaffRequest[]>(initialRequests);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const role: UserRole = backendConfigured && workspace ? (workspace.role === 'employee' ? 'employee' : 'manager') : demoRole;
  const currentEmployeeId = backendConfigured ? workspace?.employeeId : 'e1';

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
        setEmployees(saved.employees ?? initialEmployees);
        setRequests(saved.requests ?? initialRequests);
        setShifts(saved.shifts ?? initialShifts);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [backendConfigured]);

  useEffect(() => {
    if (!backendConfigured) return;
    setClockEntries([]);
    setOnBreak(false);
    setClockActionError(undefined);
  }, [backendConfigured, workspace?.employeeId]);

  useEffect(() => {
    if (!hydrated || backendConfigured) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ clockEntries, onBreak, requests, shifts, employees })).catch(() => undefined);
  }, [backendConfigured, clockEntries, employees, hydrated, onBreak, requests, shifts]);

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

    const personalTimeQuery = workspace.employeeId
      ? supabase.from('time_entries').select('id, employee_id, clocked_in_at, clocked_out_at').eq('organization_id', workspace.organizationId).eq('employee_id', workspace.employeeId).order('clocked_in_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [], error: null });
    const [employeeResult, locationResult, shiftResult, timeResult, personalTimeResult] = await Promise.all([
      supabase.from('employees').select('id, full_name, email, phone, job_title, hourly_rate_cents, employment_status, primary_location_id, user_id').eq('organization_id', workspace.organizationId).order('full_name'),
      supabase.from('locations').select('id, name').eq('organization_id', workspace.organizationId).order('name'),
      supabase.from('shifts').select('id, employee_id, starts_at, ends_at, position, status').eq('organization_id', workspace.organizationId).neq('status', 'cancelled').gte('starts_at', rangeStart.toISOString()).lt('starts_at', rangeEnd.toISOString()).order('starts_at'),
      supabase.from('time_entries').select('employee_id, clocked_in_at, clocked_out_at').eq('organization_id', workspace.organizationId).gte('clocked_in_at', timeRangeStart.toISOString()),
      personalTimeQuery,
    ]);

    const error = employeeResult.error ?? locationResult.error ?? shiftResult.error ?? timeResult.error ?? personalTimeResult.error;
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

    const liveLocations = locationResult.data ?? [];
    const locationNames = new Map(liveLocations.map((location) => [location.id, location.name]));
    setLocations(liveLocations);
    setEmployees((employeeResult.data ?? []).map((employee, index) => ({
      id: employee.id,
      name: employee.full_name,
      email: employee.email ?? undefined,
      phone: employee.phone ?? undefined,
      initials: initialsFor(employee.full_name),
      role: employee.job_title,
      color: employeeColors[index % employeeColors.length],
      status: workingEmployees.has(employee.id) ? 'clocked-in' : 'off',
      employmentStatus: normalizedEmploymentStatus(employee.employment_status),
      primaryLocationId: employee.primary_location_id ?? undefined,
      primaryLocationName: employee.primary_location_id ? locationNames.get(employee.primary_location_id) : undefined,
      hourlyRateCents: employee.hourly_rate_cents ?? undefined,
      userId: employee.user_id ?? undefined,
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
    setClockEntries((personalTimeResult.data ?? []).slice().reverse().map((entry) => ({
      id: entry.id,
      employeeId: entry.employee_id,
      clockIn: entry.clocked_in_at,
      clockOut: entry.clocked_out_at ?? undefined,
      breakMinutes: 0,
    })));
    setOnBreak(false);
    setDataLoading(false);
  }, [backendConfigured, workspace]);

  useEffect(() => {
    void refreshLiveData();
  }, [refreshLiveData]);

  const activeEntry = useMemo(
    () => currentEmployeeId ? clockEntries.find((entry) => entry.employeeId === currentEmployeeId && !entry.clockOut) : undefined,
    [clockEntries, currentEmployeeId],
  );

  const clockIn = useCallback(async () => {
    if (clockActionInFlight.current) return;
    if (backendConfigured) {
      if (!supabase || !session || !workspace?.employeeId || !workspace.locationId) {
        setClockActionError('An active employee profile and primary location are required before clocking in.');
        return;
      }
      clockActionInFlight.current = true;
      setClockActionLoading(true);
      setClockActionError(undefined);
      try {
        const { error } = await supabase.rpc('clock_in', { target_location_id: workspace.locationId });
        if (error) {
          setClockActionError(clockErrorMessage(error.message, 'in'));
          if (error.message.toLowerCase().includes('duplicate key')) await refreshLiveData();
          return;
        }
        await refreshLiveData();
      } catch (error) {
        setClockActionError(clockErrorMessage(error instanceof Error ? error.message : 'Check your connection and try again.', 'in'));
      } finally {
        clockActionInFlight.current = false;
        setClockActionLoading(false);
      }
      return;
    }
    setClockEntries((current) => {
      if (current.some((entry) => entry.employeeId === 'e1' && !entry.clockOut)) return current;
      return [...current, { id: `entry-${Date.now()}`, employeeId: 'e1', clockIn: new Date().toISOString(), breakMinutes: 0 }];
    });
  }, [backendConfigured, refreshLiveData, session, workspace]);

  const clockOut = useCallback(async () => {
    if (clockActionInFlight.current) return;
    if (backendConfigured) {
      if (!supabase || !session || !workspace?.employeeId) {
        setClockActionError('An active signed-in employee profile is required before clocking out.');
        return;
      }
      clockActionInFlight.current = true;
      setClockActionLoading(true);
      setClockActionError(undefined);
      try {
        const { error } = await supabase.rpc('clock_out');
        if (error) {
          setClockActionError(clockErrorMessage(error.message, 'out'));
          if (error.message.toLowerCase().includes('no open time entry')) await refreshLiveData();
          return;
        }
        await refreshLiveData();
      } catch (error) {
        setClockActionError(clockErrorMessage(error instanceof Error ? error.message : 'Check your connection and try again.', 'out'));
      } finally {
        clockActionInFlight.current = false;
        setClockActionLoading(false);
      }
      return;
    }
    setClockEntries((current) => current.map((entry) => (
      entry.employeeId === 'e1' && !entry.clockOut ? { ...entry, clockOut: new Date().toISOString() } : entry
    )));
    setOnBreak(false);
  }, [backendConfigured, refreshLiveData, session, workspace]);

  const toggleBreak = useCallback(() => {
    if (!backendConfigured && activeEntry) setOnBreak((current) => !current);
  }, [activeEntry, backendConfigured]);

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

  const saveEmployee = useCallback(async (input: SaveEmployeeInput) => {
    const normalizedEmail = input.email?.trim().toLowerCase() || undefined;
    const normalizedPhone = input.phone?.trim() || undefined;
    const normalizedInput = { ...input, name: input.name.trim(), role: input.role.trim(), email: normalizedEmail, phone: normalizedPhone };
    if (!backendConfigured) {
      const duplicateEmail = normalizedEmail && employees.some((employee) => employee.id !== input.id && employee.email?.toLowerCase() === normalizedEmail);
      if (duplicateEmail) throw new Error('An employee with that work email already exists.');
      const locationName = locations.find((location) => location.id === input.primaryLocationId)?.name;
      if (input.id) {
        setEmployees((current) => current.map((employee) => employee.id === input.id ? {
          ...employee,
          name: normalizedInput.name,
          email: normalizedEmail,
          phone: normalizedPhone,
          initials: initialsFor(normalizedInput.name),
          role: normalizedInput.role,
          primaryLocationId: input.primaryLocationId,
          primaryLocationName: locationName,
          hourlyRateCents: input.hourlyRateCents,
          employmentStatus: input.employmentStatus,
          status: input.employmentStatus === 'inactive' ? 'off' : employee.status,
        } : employee));
        return;
      }
      setEmployees((current) => [...current, {
        id: `employee-${Date.now()}`,
        name: normalizedInput.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        initials: initialsFor(normalizedInput.name),
        role: normalizedInput.role,
        color: employeeColors[current.length % employeeColors.length],
        status: 'off',
        employmentStatus: input.employmentStatus,
        primaryLocationId: input.primaryLocationId,
        primaryLocationName: locationName,
        hourlyRateCents: input.hourlyRateCents,
        weeklyHours: 0,
      }]);
      return;
    }

    if (!supabase || !session || !workspace) throw new Error('Sign in again before changing employee details.');
    const payload = {
      primary_location_id: input.primaryLocationId || null,
      full_name: normalizedInput.name,
      email: normalizedEmail ?? null,
      phone: normalizedPhone ?? null,
      job_title: normalizedInput.role,
      hourly_rate_cents: input.hourlyRateCents ?? null,
      employment_status: input.employmentStatus,
    };
    const result = input.id
      ? await supabase.from('employees').update(payload).eq('organization_id', workspace.organizationId).eq('id', input.id).select('id').single()
      : await supabase.from('employees').insert({ organization_id: workspace.organizationId, ...payload }).select('id').single();
    if (result.error) throw new Error(employeeErrorMessage(result.error.message));
    await refreshLiveData();
  }, [backendConfigured, employees, locations, refreshLiveData, session, workspace]);

  const inviteEmployee = useCallback(async (employeeId: string) => {
    if (!backendConfigured || !supabase || !session || !workspace) {
      throw new Error('Sign in to the live restaurant workspace before sending invitations.');
    }
    if (workspace.role === 'employee') throw new Error('Only an owner or manager can invite employees.');

    const { data, error } = await supabase.functions.invoke('invite-employee', {
      body: { employeeId },
    });
    if (error) throw new Error(await invitationErrorMessage(error));
    await refreshLiveData();
    return (data as { message?: string } | null)?.message ?? 'Invitation sent.';
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
    hydrated, dataLoading, dataError, liveClockEnabled: backendConfigured, clockActionLoading, clockActionError, employees, locations, role, setRole: setDemoRole, clockEntries, activeEntry, onBreak, requests, shifts,
    clockIn, clockOut, toggleBreak, resolveRequest, addTimeOffRequest, addShift, saveEmployee, inviteEmployee, publishSchedule, refreshLiveData,
  }), [activeEntry, addShift, addTimeOffRequest, backendConfigured, clockActionError, clockActionLoading, clockEntries, clockIn, clockOut, dataError, dataLoading, employees, hydrated, inviteEmployee, locations, onBreak, publishSchedule, refreshLiveData, requests, resolveRequest, role, saveEmployee, shifts, toggleBreak]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
