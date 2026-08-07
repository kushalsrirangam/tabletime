import type { Session } from '@supabase/supabase-js';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isBackendConfigured, supabase } from '../lib/supabase';

export type WorkspaceRole = 'owner' | 'manager' | 'employee';

export type Workspace = {
  membershipId: string;
  organizationId: string;
  organizationName: string;
  organizationTimezone: string;
  role: WorkspaceRole;
  employeeId?: string;
  fullName: string;
  jobTitle: string;
  locationId?: string;
  locationName?: string;
  locationAddress?: string;
  locationTimezone?: string;
};

type AuthContextValue = {
  backendConfigured: boolean;
  loading: boolean;
  session: Session | null;
  workspaceLoading: boolean;
  workspaceError?: string;
  hasMembership: boolean;
  workspace: Workspace | null;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; emailConfirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  refreshMembership: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(isBackendConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string>();
  const [hasMembership, setHasMembership] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setWorkspaceLoading(Boolean(data.session));
      setSession(data.session);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setWorkspaceLoading(Boolean(nextSession));
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Backend credentials are not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message;
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: 'Backend credentials are not configured.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    return { error: error?.message, emailConfirmationRequired: !error && !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const refreshMembership = useCallback(async () => {
    if (!supabase || !session) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(undefined);
      setWorkspaceLoading(false);
      return;
    }

    setWorkspaceLoading(true);
    setWorkspaceError(undefined);
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('id, organization_id, role, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(membershipError.message);
      setWorkspaceLoading(false);
      return;
    }

    if (!membership) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceLoading(false);
      return;
    }

    if (!['owner', 'manager', 'employee'].includes(membership.role)) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError('This account has an unsupported restaurant role.');
      setWorkspaceLoading(false);
      return;
    }

    const [organizationResult, employeeResult, profileResult] = await Promise.all([
      supabase.from('organizations').select('id, name, timezone').eq('id', membership.organization_id).maybeSingle(),
      supabase.from('employees').select('id, full_name, job_title, primary_location_id').eq('organization_id', membership.organization_id).eq('user_id', session.user.id).maybeSingle(),
      supabase.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle(),
    ]);

    const relatedError = organizationResult.error ?? employeeResult.error ?? profileResult.error;
    if (relatedError || !organizationResult.data) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(relatedError?.message ?? 'The restaurant workspace could not be found.');
      setWorkspaceLoading(false);
      return;
    }

    const employee = employeeResult.data;
    const locationResult = employee?.primary_location_id
      ? await supabase.from('locations').select('id, name, address, timezone').eq('id', employee.primary_location_id).maybeSingle()
      : { data: null, error: null };

    if (locationResult.error) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(locationResult.error.message);
      setWorkspaceLoading(false);
      return;
    }

    setWorkspace({
      membershipId: membership.id,
      organizationId: organizationResult.data.id,
      organizationName: organizationResult.data.name,
      organizationTimezone: organizationResult.data.timezone,
      role: membership.role as WorkspaceRole,
      employeeId: employee?.id,
      fullName: employee?.full_name ?? profileResult.data?.full_name ?? session.user.email ?? 'Team member',
      jobTitle: employee?.job_title ?? (membership.role === 'owner' ? 'Owner' : membership.role === 'manager' ? 'Manager' : 'Team member'),
      locationId: locationResult.data?.id,
      locationName: locationResult.data?.name,
      locationAddress: locationResult.data?.address ?? undefined,
      locationTimezone: locationResult.data?.timezone,
    });
    setHasMembership(true);
    setWorkspaceLoading(false);
  }, [session]);

  useEffect(() => {
    void refreshMembership();
  }, [refreshMembership]);

  const value = useMemo(() => ({
    backendConfigured: isBackendConfigured,
    loading,
    session,
    workspaceLoading,
    workspaceError,
    hasMembership,
    workspace,
    signIn,
    signUp,
    signOut,
    refreshMembership,
  }), [hasMembership, loading, refreshMembership, session, signIn, signOut, signUp, workspace, workspaceError, workspaceLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
