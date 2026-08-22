import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const productionOrigin = "https://tabletime-3qn4.vercel.app";

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
    return jsonResponse(origin, 405, { code: "method_not_allowed", message: "Use POST to delete an account." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(origin, 401, { code: "authentication_required", message: "Sign in before deleting an account." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Required Supabase function secrets are missing.");
    return jsonResponse(origin, 500, { code: "server_configuration", message: "Account deletion is not configured on the server." });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const token = authorization.slice("Bearer ".length);
  const { data: userResult, error: userError } = await serviceClient.auth.getUser(token);
  const actor = userResult.user;
  if (userError || !actor) {
    return jsonResponse(origin, 401, { code: "invalid_session", message: "Your session expired. Sign in again before deleting the account." });
  }

  const { data: preparationRows, error: preparationError } = await serviceClient.rpc("prepare_account_deletion", {
    p_user_id: actor.id,
  });

  if (preparationError) {
    const normalized = preparationError.message.toLowerCase();
    if (normalized.includes("transfer ownership")) {
      return jsonResponse(origin, 409, { code: "ownership_transfer_required", message: preparationError.message });
    }
    if (normalized.includes("multiple restaurants")) {
      return jsonResponse(origin, 409, { code: "multiple_restaurants", message: preparationError.message });
    }
    console.error("Account deletion preparation failed", preparationError.message);
    return jsonResponse(origin, 500, { code: "preparation_failed", message: "The account could not be prepared for deletion." });
  }

  const { error: deletionError } = await serviceClient.auth.admin.deleteUser(actor.id, true);
  if (deletionError) {
    console.error("Auth account deletion failed after de-identification", deletionError.message);
    return jsonResponse(origin, 500, {
      code: "auth_deletion_failed",
      message: "Your restaurant access and personal details were removed, but sign-in deletion needs support follow-up.",
    });
  }

  const result = Array.isArray(preparationRows) ? preparationRows[0] : preparationRows;
  return jsonResponse(origin, 200, {
    deleted: true,
    mode: result?.deletion_mode ?? "account_deleted",
    message: result?.deletion_mode === "workspace_deleted"
      ? "Your account and restaurant workspace were deleted."
      : "Your account was deleted and retained restaurant records were de-identified.",
  });
});
