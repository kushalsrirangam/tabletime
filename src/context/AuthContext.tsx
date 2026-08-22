import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
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
  invitationLoading: boolean;
  invitationPending: boolean;
  invitationError?: string;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; emailConfirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  completeInvitation: (password: string) => Promise<string | undefined>;
  cancelInvitation: () => Promise<void>;
  refreshMembership: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isTransientWorkspaceError(message: string) {
  const normalized = message.toLowerCase();
  return ['fetch', 'network', 'timeout', 'timed out', 'connection', 'socket', '502', '503', '504'].some((fragment) => normalized.includes(fragment));
}

function workspaceErrorMessage(message: string) {
  if (isTransientWorkspaceError(message)) return 'The restaurant database is temporarily unavailable. It may be waking from inactivity; wait a moment and try again.';
  if (message.toLowerCase().includes('jwt')) return 'Your session expired. Sign out and sign in again.';
  return message;
}

async function withTransientRetry<T>(operation: () => PromiseLike<T>) {
  let result = await operation();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const error = (result as { error?: { message?: string } | null }).error;
    if (!error?.message || !isTransientWorkspaceError(error.message)) break;
    await new Promise<void>((resolve) => setTimeout(resolve, 400 * (2 ** attempt)));
    result = await operation();
  }
  return result;
}

function readInvitationTokens(url: string) {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const queryEnd = hashIndex >= 0 ? hashIndex : url.length;
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1, queryEnd) : '';
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const queryParams = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);
  const value = (key: string) => hashParams.get(key) ?? queryParams.get(key);
  return {
    type: value('type'),
    accessToken: value('access_token'),
    refreshToken: value('refresh_token'),
  };
}

function clearInvitationUrl() {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(isBackendConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string>();
  const [hasMembership, setHasMembership] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationPending, setInvitationPending] = useState(false);
  const [invitationError, setInvitationError] = useState<string>();

  const handleInvitationUrl = useCallback(async (url: string) => {
    const tokens = readInvitationTokens(url);
    if (tokens.type !== 'invite') return false;

    setInvitationPending(true);
    setInvitationLoading(true);
    setInvitationError(undefined);
    if (!supabase || !tokens.accessToken || !tokens.refreshToken) {
      setInvitationError('This invitation link is incomplete or expired. Ask your manager to send a new invitation.');
      setInvitationLoading(false);
      return true;
    }

    const { error } = await supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    if (error) setInvitationError(`This invitation could not be opened. ${error.message}`);
    setInvitationLoading(false);
    return true;
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    const initialize = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) await handleInvitationUrl(initialUrl);
        const { data } = await client.auth.getSession();
        if (!active) return;
        setWorkspaceLoading(Boolean(data.session));
        setSession(data.session);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void initialize();

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setWorkspaceLoading(Boolean(nextSession));
      setSession(nextSession);
    });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleInvitationUrl(url);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, [handleInvitationUrl]);

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
    setInvitationPending(false);
    setInvitationLoading(false);
    setInvitationError(undefined);
    clearInvitationUrl();
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
    const client = supabase;
    const { data: membership, error: membershipError } = await withTransientRetry(() => client
      .from('memberships')
      .select('id, organization_id, role, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle());

    if (membershipError) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(workspaceErrorMessage(membershipError.message));
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
      withTransientRetry(() => client.from('organizations').select('id, name, timezone').eq('id', membership.organization_id).maybeSingle()),
      withTransientRetry(() => client.from('employees').select('id, full_name, job_title, primary_location_id').eq('organization_id', membership.organization_id).eq('user_id', session.user.id).maybeSingle()),
      withTransientRetry(() => client.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle()),
    ]);

    const relatedError = organizationResult.error ?? employeeResult.error ?? profileResult.error;
    if (relatedError || !organizationResult.data) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(workspaceErrorMessage(relatedError?.message ?? 'The restaurant workspace could not be found.'));
      setWorkspaceLoading(false);
      return;
    }

    const employee = employeeResult.data;
    const locationResult = employee?.primary_location_id
      ? await withTransientRetry(() => client.from('locations').select('id, name, address, timezone').eq('id', employee.primary_location_id!).maybeSingle())
      : { data: null, error: null };

    if (locationResult.error) {
      setHasMembership(false);
      setWorkspace(null);
      setWorkspaceError(workspaceErrorMessage(locationResult.error.message));
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

  const completeInvitation = useCallback(async (password: string) => {
    if (!supabase || !session) return 'The invitation session is missing. Ask your manager to send a new invitation.';
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) return passwordError.message;

    const { error: acceptError } = await supabase.rpc('accept_employee_invitation');
    if (acceptError) return `Your password was saved, but the employee account could not be activated. ${acceptError.message}`;

    setInvitationPending(false);
    setInvitationError(undefined);
    clearInvitationUrl();
    await refreshMembership();
    return undefined;
  }, [refreshMembership, session]);

  const cancelInvitation = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const value = useMemo(() => ({
    backendConfigured: isBackendConfigured,
    loading,
    session,
    workspaceLoading,
    workspaceError,
    hasMembership,
    workspace,
    invitationLoading,
    invitationPending,
    invitationError,
    signIn,
    signUp,
    signOut,
    completeInvitation,
    cancelInvitation,
    refreshMembership,
  }), [cancelInvitation, completeInvitation, hasMembership, invitationError, invitationLoading, invitationPending, loading, refreshMembership, session, signIn, signOut, signUp, workspace, workspaceError, workspaceLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
