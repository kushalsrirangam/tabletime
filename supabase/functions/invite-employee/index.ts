import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const productionOrigin = "https://tabletime-3qn4.vercel.app";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  if (origin === productionOrigin) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  const configured = (Deno.env.get("TABLETIME_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.includes(origin);
}

function responseHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function jsonResponse(origin: string | null, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ code: "origin_not_allowed", message: "This app origin is not allowed." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }

  if (request.method !== "POST") {
    return jsonResponse(origin, 405, { code: "method_not_allowed", message: "Use POST for employee invitations." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(origin, 401, { code: "authentication_required", message: "Sign in before inviting an employee." });
  }

  let payload: { employeeId?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(origin, 400, { code: "invalid_request", message: "The invitation request was not valid JSON." });
  }

  if (typeof payload.employeeId !== "string" || !uuidPattern.test(payload.employeeId)) {
    return jsonResponse(origin, 400, { code: "invalid_employee", message: "Choose a valid employee before sending an invitation." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Required Supabase function secrets are missing.");
    return jsonResponse(origin, 500, { code: "server_configuration", message: "Employee invitations are not configured on the server." });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const token = authorization.slice("Bearer ".length);
  const { data: userResult, error: userError } = await serviceClient.auth.getUser(token);
  const actor = userResult.user;
  if (userError || !actor) {
    return jsonResponse(origin, 401, { code: "invalid_session", message: "Your session expired. Sign in again before inviting an employee." });
  }

  const { data: employee, error: employeeError } = await serviceClient
    .from("employees")
    .select("id, organization_id, full_name, email, user_id, employment_status")
    .eq("id", payload.employeeId)
    .maybeSingle();

  if (employeeError) {
    console.error("Employee lookup failed", employeeError.message);
    return jsonResponse(origin, 500, { code: "employee_lookup_failed", message: "The employee record could not be checked." });
  }
  if (!employee) {
    return jsonResponse(origin, 404, { code: "employee_not_found", message: "The employee record could not be found." });
  }

  const { data: managerMembership, error: membershipError } = await serviceClient
    .from("memberships")
    .select("id")
    .eq("organization_id", employee.organization_id)
    .eq("user_id", actor.id)
    .in("role", ["owner", "manager"])
    .maybeSingle();

  if (membershipError) {
    console.error("Manager membership lookup failed", membershipError.message);
    return jsonResponse(origin, 500, { code: "membership_lookup_failed", message: "Your manager access could not be checked." });
  }
  if (!managerMembership) {
    return jsonResponse(origin, 403, { code: "manager_required", message: "Only an owner or manager can invite employees." });
  }
  if (employee.user_id) {
    return jsonResponse(origin, 409, { code: "account_connected", message: "An app account is already connected to this employee." });
  }

  const email = employee.email?.trim().toLowerCase();
  if (!email) {
    return jsonResponse(origin, 422, { code: "email_required", message: "Add and save a work email before inviting this employee." });
  }
  if (employee.employment_status === "inactive") {
    return jsonResponse(origin, 422, { code: "employee_inactive", message: "Activate this employee before sending an invitation." });
  }

  const redirectTo = origin ? `${origin}/` : "tabletime://invite";
  const { data: inviteResult, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { full_name: employee.full_name, employee_id: employee.id },
  });

  if (inviteError || !inviteResult.user) {
    const normalized = inviteError?.message.toLowerCase() ?? "";
    if (normalized.includes("already") || normalized.includes("registered") || normalized.includes("exists")) {
      return jsonResponse(origin, 409, { code: "email_registered", message: "An Auth account already exists for this email. Use another work email or contact support to link the existing account safely." });
    }
    if (normalized.includes("rate") || normalized.includes("limit")) {
      return jsonResponse(origin, 429, { code: "email_rate_limit", message: "The invitation email limit was reached. Wait a few minutes and try again." });
    }
    console.error("Auth invitation failed", inviteError?.message ?? "No user returned");
    return jsonResponse(origin, 500, { code: "invite_failed", message: "The invitation email could not be sent." });
  }

  const invitedUserId = inviteResult.user.id;
  const { error: finalizeError } = await serviceClient.rpc("finalize_employee_invitation", {
    p_target_employee_id: employee.id,
    p_invited_user_id: invitedUserId,
    p_actor_user_id: actor.id,
  });

  if (finalizeError) {
    console.error("Invitation linking failed", finalizeError.message);
    const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(invitedUserId);
    if (cleanupError) console.error("Invitation cleanup failed", cleanupError.message);
    return jsonResponse(origin, 500, { code: "link_failed", message: "The invitation could not be linked to the employee. No app account was connected." });
  }

  return jsonResponse(origin, 200, {
    employeeId: employee.id,
    email,
    message: `Invitation sent to ${email}.`,
  });
});
