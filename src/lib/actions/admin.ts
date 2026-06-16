"use server";

import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdminActionAccess() {
  const session = await getSessionProfile();

  if (session.appUser.role !== "admin") {
    redirect("/app");
  }

  return session.appUser;
}

function readClientFields(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const companyNameRaw = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim().toLowerCase();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  return {
    clientId,
    companyName: companyNameRaw || null,
    contactName,
    contactEmail,
    contactPhone: contactPhone || null,
    password,
    confirmPassword
  };
}

export async function createClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const { companyName, contactName, contactEmail, contactPhone } = readClientFields(formData);

  if (!contactName || !contactEmail) {
    redirect("/admin/clientes/novo?error=invalid-fields");
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from("clients").insert({
    company_name: companyName,
    trade_name: companyName,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    source: "admin",
    status: "active"
  });

  if (error) {
    redirect(`/admin/clientes/novo?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/clientes?created=1");
}

export async function updateClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const { clientId, companyName, contactName, contactEmail, contactPhone, password, confirmPassword } = readClientFields(formData);

  if (!clientId || !contactName || !contactEmail) {
    redirect(`/admin/clientes/${clientId || ""}?error=invalid-fields`);
  }

  if ((password || confirmPassword) && (password.length < 6 || password !== confirmPassword)) {
    redirect(`/admin/clientes/${clientId}?error=password-invalid`);
  }

  const adminSupabase = createAdminClient();
  const updatedAt = new Date().toISOString();

  const { error } = await adminSupabase
    .from("clients")
    .update({
      company_name: companyName,
      trade_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      updated_at: updatedAt
    })
    .eq("id", clientId)
    .is("deleted_at", null);

  if (error) {
    redirect(`/admin/clientes/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const { data: linkedUsers, error: linkedUsersError } = await adminSupabase
    .from("app_users")
    .select("id, role, auth_provider, auth_provider_user_id")
    .eq("client_id", clientId)
    .is("deleted_at", null);

  if (linkedUsersError) {
    redirect(`/admin/clientes/${clientId}?error=${encodeURIComponent(linkedUsersError.message)}`);
  }

  if (linkedUsers && linkedUsers.length > 0) {
    const linkedUserIds = linkedUsers.map((user) => user.id);

    const { error: updateAppUsersError } = await adminSupabase
      .from("app_users")
      .update({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        updated_at: updatedAt
      })
      .in("id", linkedUserIds)
      .is("deleted_at", null);

    if (updateAppUsersError) {
      redirect(`/admin/clientes/${clientId}?error=${encodeURIComponent(updateAppUsersError.message)}`);
    }

    for (const linkedUser of linkedUsers) {
      if (linkedUser.auth_provider === "supabase" && linkedUser.auth_provider_user_id) {
        const updatePayload: {
          email: string;
          password?: string;
          user_metadata: {
            name: string;
            company: string | null;
            phone: string | null;
            role: string;
          };
        } = {
          email: contactEmail,
          user_metadata: {
            name: contactName,
            company: companyName,
            phone: contactPhone,
            role: linkedUser.role
          }
        };

        if (password) {
          updatePayload.password = password;
        }

        const { error: updateAuthUserError } = await adminSupabase.auth.admin.updateUserById(
          linkedUser.auth_provider_user_id,
          updatePayload
        );

        if (updateAuthUserError) {
          redirect(`/admin/clientes/${clientId}?error=${encodeURIComponent(updateAuthUserError.message)}`);
        }
      }
    }
  } else if (password) {
    redirect(`/admin/clientes/${clientId}?error=linked-user-not-found`);
  }

  redirect("/admin/clientes?updated=1");
}

export async function softDeleteClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const clientId = String(formData.get("clientId") ?? "").trim();

  if (!clientId) {
    redirect("/admin/clientes?error=missing-client");
  }

  const adminSupabase = createAdminClient();
  const deletedAt = new Date().toISOString();

  const { data: linkedUsers, error: linkedUsersError } = await adminSupabase
    .from("app_users")
    .select("id, auth_provider_user_id")
    .eq("client_id", clientId)
    .is("deleted_at", null);

  if (linkedUsersError) {
    redirect(`/admin/clientes?error=${encodeURIComponent(linkedUsersError.message)}`);
  }

  const { error: clientError } = await adminSupabase
    .from("clients")
    .update({
      status: "inactive",
      deleted_at: deletedAt,
      updated_at: deletedAt
    })
    .eq("id", clientId)
    .is("deleted_at", null);

  if (clientError) {
    redirect(`/admin/clientes?error=${encodeURIComponent(clientError.message)}`);
  }

  if (linkedUsers && linkedUsers.length > 0) {
    const linkedUserIds = linkedUsers.map((user) => user.id);

    const { error: appUsersError } = await adminSupabase
      .from("app_users")
      .update({
        status: "inactive",
        deleted_at: deletedAt,
        updated_at: deletedAt
      })
      .in("id", linkedUserIds)
      .is("deleted_at", null);

    if (appUsersError) {
      redirect(`/admin/clientes?error=${encodeURIComponent(appUsersError.message)}`);
    }
  }

  redirect("/admin/clientes?deleted=1");
}

export async function createAdminUserAction(formData: FormData) {
  await requireAdminActionAccess();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) {
    redirect("/admin/usuarios?error=invalid-fields");
  }

  const adminSupabase = createAdminClient();

  const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: "admin"
    }
  });

  if (createUserError || !createdUser.user) {
    redirect(`/admin/usuarios?error=${encodeURIComponent(createUserError?.message ?? "create-user-failed")}`);
  }

  const { error: insertAppUserError } = await adminSupabase.from("app_users").insert({
    name,
    email,
    role: "admin",
    status: "active",
    auth_provider: "supabase",
    auth_provider_user_id: createdUser.user.id
  });

  if (insertAppUserError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);
    redirect(`/admin/usuarios?error=${encodeURIComponent(insertAppUserError.message)}`);
  }

  redirect("/admin/usuarios?created=1");
}
