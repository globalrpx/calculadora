"use server";

import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminUserStatusValues,
  type AdminUserFormFieldErrors,
  type AdminUserFormState,
  type AdminUserFormValues
} from "@/lib/admin/admin-user-form-state";
import {
  clientTypeValues,
  type ClientFormFieldErrors,
  type ClientFormState,
  type ClientFormValues
} from "@/lib/admin/client-form-state";
import {
  simulationStatusValues,
  type SimulationFormFieldErrors,
  type SimulationFormState,
  type SimulationFormValues
} from "@/lib/admin/simulation-form-state";

const duplicateEmailMessage = "Este e-mail já está cadastrado. Use outro e-mail ou edite o cliente existente.";
const duplicateAdminEmailMessage = "Este e-mail já está cadastrado. Use outro e-mail ou edite o usuário existente.";
const reviewFieldsMessage = "Revise os campos destacados antes de continuar.";
const unexpectedClientSaveMessage = "Não foi possível salvar o cliente. Tente novamente em instantes.";
const unexpectedSimulationSaveMessage = "Não foi possível salvar a simulação. Tente novamente em instantes.";
const unexpectedAdminUserSaveMessage = "Não foi possível salvar o usuário admin. Tente novamente em instantes.";

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
  const clientType = String(formData.get("clientType") ?? "").trim() || "client";
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  return {
    clientId,
    companyName: companyNameRaw || null,
    contactName,
    contactEmail,
    contactPhone: contactPhone || null,
    clientType,
    password,
    confirmPassword
  };
}

function readAdminUserFields(formData: FormData) {
  const userId = String(formData.get("userId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const status = String(formData.get("status") ?? "").trim() || "active";
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  return {
    userId,
    name,
    email,
    status,
    password,
    confirmPassword
  };
}

function hasFieldErrors(fieldErrors: Record<string, string | undefined>) {
  return Object.values(fieldErrors).some(Boolean);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildClientFormValues(fields: ReturnType<typeof readClientFields>): ClientFormValues {
  return {
    id: fields.clientId || undefined,
    companyName: fields.companyName,
    contactName: fields.contactName,
    contactEmail: fields.contactEmail,
    contactPhone: fields.contactPhone,
    clientType: clientTypeValues.includes(fields.clientType as (typeof clientTypeValues)[number])
      ? (fields.clientType as (typeof clientTypeValues)[number])
      : "client"
  };
}

function buildAdminUserFormValues(fields: ReturnType<typeof readAdminUserFields>): AdminUserFormValues {
  return {
    id: fields.userId || undefined,
    name: fields.name,
    email: fields.email,
    status: fields.status
  };
}

function buildClientFormError(
  fields: ReturnType<typeof readClientFields>,
  fieldErrors: ClientFormFieldErrors,
  message = reviewFieldsMessage
): ClientFormState {
  return {
    success: false,
    message,
    fieldErrors,
    values: buildClientFormValues(fields)
  };
}

function validateClientFields(fields: ReturnType<typeof readClientFields>, options: { passwordRequired: boolean }) {
  const fieldErrors: ClientFormFieldErrors = {};

  if (!fields.contactName) {
    fieldErrors.contactName = "Informe o nome do cliente.";
  }

  if (!fields.contactEmail) {
    fieldErrors.contactEmail = "Informe o e-mail do cliente.";
  } else if (!isValidEmail(fields.contactEmail)) {
    fieldErrors.contactEmail = "Informe um e-mail válido.";
  }

  if (!clientTypeValues.includes(fields.clientType as (typeof clientTypeValues)[number])) {
    fieldErrors.clientType = "Selecione um tipo de cliente válido.";
  }

  if (options.passwordRequired || fields.password || fields.confirmPassword) {
    if (!fields.password) {
      fieldErrors.password = "Informe uma senha de acesso.";
    } else if (fields.password.length < 6) {
      fieldErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!fields.confirmPassword) {
      fieldErrors.confirmPassword = "Confirme a senha de acesso.";
    } else if (fields.password && fields.password !== fields.confirmPassword) {
      fieldErrors.confirmPassword = "As senhas não conferem.";
    }
  }

  return fieldErrors;
}

function validateAdminUserFields(fields: ReturnType<typeof readAdminUserFields>, options: { passwordRequired: boolean }) {
  const fieldErrors: AdminUserFormFieldErrors = {};

  if (!fields.name) {
    fieldErrors.name = "Informe o nome do usuário.";
  }

  if (!fields.email) {
    fieldErrors.email = "Informe o e-mail do usuário.";
  } else if (!isValidEmail(fields.email)) {
    fieldErrors.email = "Informe um e-mail válido.";
  }

  if (!adminUserStatusValues.includes(fields.status as (typeof adminUserStatusValues)[number])) {
    fieldErrors.status = "Selecione um status válido.";
  }

  if (options.passwordRequired || fields.password || fields.confirmPassword) {
    if (!fields.password) {
      fieldErrors.password = "Informe uma senha de acesso.";
    } else if (fields.password.length < 6) {
      fieldErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!fields.confirmPassword) {
      fieldErrors.confirmPassword = "Confirme a senha de acesso.";
    } else if (fields.password && fields.password !== fields.confirmPassword) {
      fieldErrors.confirmPassword = "As senhas não conferem.";
    }
  }

  return fieldErrors;
}

function buildAdminUserFormError(
  fields: ReturnType<typeof readAdminUserFields>,
  fieldErrors: AdminUserFormFieldErrors,
  message = reviewFieldsMessage
): AdminUserFormState {
  return {
    success: false,
    message,
    fieldErrors,
    values: buildAdminUserFormValues(fields)
  };
}

function isDuplicateEmailError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; name?: string; status?: number };
  const message = `${candidate.message ?? ""} ${candidate.name ?? ""}`.toLowerCase();

  return (
    candidate.code === "23505" ||
    candidate.status === 422 ||
    message.includes("duplicate") ||
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists") ||
    message.includes("unique") ||
    message.includes("email")
  );
}

async function findDuplicatedClientEmail(adminSupabase: ReturnType<typeof createAdminClient>, email: string, currentClientId?: string) {
  const { data, error } = await adminSupabase
    .from("app_users")
    .select("id, client_id")
    .ilike("email", email)
    .is("deleted_at", null)
    .limit(10);

  if (error) {
    return { error };
  }

  const duplicated = data?.some((user) => user.client_id !== currentClientId) ?? false;
  return { duplicated };
}

async function findDuplicatedAppUserEmail(adminSupabase: ReturnType<typeof createAdminClient>, email: string, currentUserId?: string) {
  const { data, error } = await adminSupabase
    .from("app_users")
    .select("id")
    .ilike("email", email)
    .is("deleted_at", null)
    .limit(10);

  if (error) {
    return { error };
  }

  const duplicated = data?.some((user) => user.id !== currentUserId) ?? false;
  return { duplicated };
}

function buildSafeAdminClientsRedirect(rawRedirectTo: string, feedback: string) {
  const fallback = "/admin/clientes";
  const redirectTo = rawRedirectTo.startsWith("/admin/clientes") ? rawRedirectTo : fallback;
  const [pathname, query = ""] = redirectTo.split("?");
  const params = new URLSearchParams(query);

  params.delete("created");
  params.delete("updated");
  params.delete("deleted");
  params.delete("error");
  params.set(feedback, "1");

  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function buildSafeAdminUsersRedirect(rawRedirectTo: string, feedback: string) {
  const fallback = "/admin/usuarios";
  const redirectTo = rawRedirectTo.startsWith("/admin/usuarios") ? rawRedirectTo : fallback;
  const [pathname, query = ""] = redirectTo.split("?");
  const params = new URLSearchParams(query);

  params.delete("created");
  params.delete("updated");
  params.delete("deactivated");
  params.delete("reactivated");
  params.delete("selfDeactivate");
  params.delete("error");
  params.set(feedback, "1");

  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function readSimulationFields(formData: FormData): SimulationFormValues {
  return {
    id: String(formData.get("simulationId") ?? "").trim() || undefined,
    clientId: String(formData.get("clientId") ?? "").trim(),
    quoteId: String(formData.get("quoteId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    clientNotes: String(formData.get("clientNotes") ?? "").trim()
  };
}

function validateSimulationFields(fields: SimulationFormValues, options: { requireClient: boolean; requireTitle: boolean }) {
  const fieldErrors: SimulationFormFieldErrors = {};

  if (options.requireClient && !fields.clientId) {
    fieldErrors.clientId = "Selecione um cliente.";
  }

  if (options.requireTitle && !fields.title) {
    fieldErrors.title = "Informe o título da simulação.";
  }

  if (!simulationStatusValues.includes(fields.status as (typeof simulationStatusValues)[number])) {
    fieldErrors.status = "Selecione um status válido.";
  }

  return fieldErrors;
}

function buildSimulationFormError(
  fields: SimulationFormValues,
  fieldErrors: SimulationFormFieldErrors,
  message = reviewFieldsMessage
): SimulationFormState {
  return {
    success: false,
    message,
    fieldErrors,
    values: fields
  };
}

export async function createClientAction(_previousState: ClientFormState, formData: FormData): Promise<ClientFormState> {
  await requireAdminActionAccess();

  const fields = readClientFields(formData);
  const { companyName, contactName, contactEmail, contactPhone, clientType, password } = fields;
  const fieldErrors = validateClientFields(fields, {
    passwordRequired: true
  });

  if (hasFieldErrors(fieldErrors)) {
    return buildClientFormError(fields, fieldErrors);
  }

  const adminSupabase = createAdminClient();

  const duplicatedEmail = await findDuplicatedClientEmail(adminSupabase, contactEmail);

  if (duplicatedEmail.error) {
    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  if (duplicatedEmail.duplicated) {
    return buildClientFormError(fields, {
      contactEmail: duplicateEmailMessage
    });
  }

  const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
    email: contactEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: contactName,
      company: companyName,
      phone: contactPhone,
      role: "client"
    }
  });

  if (createUserError || !createdUser.user) {
    if (isDuplicateEmailError(createUserError)) {
      return buildClientFormError(fields, {
        contactEmail: duplicateEmailMessage
      });
    }

    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  const { data: client, error: clientError } = await adminSupabase
    .from("clients")
    .insert({
      company_name: companyName,
      trade_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      client_type: clientType,
      source: "admin",
      status: "active"
    })
    .select("id")
    .single();

  if (clientError || !client) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);

    if (isDuplicateEmailError(clientError)) {
      return buildClientFormError(fields, {
        contactEmail: duplicateEmailMessage
      });
    }

    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  const { error: appUserError } = await adminSupabase.from("app_users").insert({
    name: contactName,
    email: contactEmail,
    phone: contactPhone,
    role: "client",
    status: "active",
    client_id: client.id,
    auth_provider: "supabase",
    auth_provider_user_id: createdUser.user.id
  });

  if (appUserError) {
    await adminSupabase.from("clients").delete().eq("id", client.id);
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);

    if (isDuplicateEmailError(appUserError)) {
      return buildClientFormError(fields, {
        contactEmail: duplicateEmailMessage
      });
    }

    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  redirect("/admin/clientes?created=1");
}

export async function updateClientAction(_previousState: ClientFormState, formData: FormData): Promise<ClientFormState> {
  await requireAdminActionAccess();

  const fields = readClientFields(formData);
  const { clientId, companyName, contactName, contactEmail, contactPhone, clientType, password } = fields;
  const fieldErrors = validateClientFields(fields, {
    passwordRequired: false
  });

  if (!clientId) {
    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  if (hasFieldErrors(fieldErrors)) {
    return buildClientFormError(fields, fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const updatedAt = new Date().toISOString();

  const duplicatedEmail = await findDuplicatedClientEmail(adminSupabase, contactEmail, clientId);

  if (duplicatedEmail.error) {
    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  if (duplicatedEmail.duplicated) {
    return buildClientFormError(fields, {
      contactEmail: duplicateEmailMessage
    });
  }

  const { error } = await adminSupabase
    .from("clients")
    .update({
      company_name: companyName,
      trade_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      client_type: clientType,
      updated_at: updatedAt
    })
    .eq("id", clientId)
    .is("deleted_at", null);

  if (error) {
    if (isDuplicateEmailError(error)) {
      return buildClientFormError(fields, {
        contactEmail: duplicateEmailMessage
      });
    }

    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
  }

  const { data: linkedUsers, error: linkedUsersError } = await adminSupabase
    .from("app_users")
    .select("id, role, auth_provider, auth_provider_user_id")
    .eq("client_id", clientId)
    .is("deleted_at", null);

  if (linkedUsersError) {
    return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
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
      if (isDuplicateEmailError(updateAppUsersError)) {
        return buildClientFormError(fields, {
          contactEmail: duplicateEmailMessage
        });
      }

      return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
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
          if (isDuplicateEmailError(updateAuthUserError)) {
            return buildClientFormError(fields, {
              contactEmail: duplicateEmailMessage
            });
          }

          return buildClientFormError(fields, {}, unexpectedClientSaveMessage);
        }
      }
    }
  } else if (password) {
    return buildClientFormError(fields, {}, "Não existe usuário vinculado a este cliente para redefinir a senha.");
  }

  redirect("/admin/clientes?updated=1");
}

export async function softDeleteClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const clientId = String(formData.get("clientId") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

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

  redirect(buildSafeAdminClientsRedirect(redirectTo, "deleted"));
}

export async function createAdminSimulationAction(
  _previousState: SimulationFormState,
  formData: FormData
): Promise<SimulationFormState> {
  const adminUser = await requireAdminActionAccess();
  const fields = readSimulationFields(formData);
  const fieldErrors = validateSimulationFields(fields, {
    requireClient: true,
    requireTitle: true
  });

  if (hasFieldErrors(fieldErrors)) {
    return buildSimulationFormError(fields, fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const clientId = fields.clientId;
  const quoteId: string | null = fields.quoteId || null;

  if (quoteId) {
    const { data: quote, error: quoteError } = await adminSupabase
      .from("quotes")
      .select("id, client_id")
      .eq("id", quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      return buildSimulationFormError(fields, {
        quoteId: "Cotação vinculada não encontrada."
      });
    }

    if (quote.client_id !== clientId) {
      return buildSimulationFormError(fields, {
        quoteId: "A cotação selecionada pertence a outro cliente."
      });
    }
  } else {
    const { data: client, error: clientError } = await adminSupabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .is("deleted_at", null)
      .maybeSingle();

    if (clientError || !client) {
      return buildSimulationFormError(fields, {
        clientId: "Cliente não encontrado."
      });
    }
  }

  const now = new Date().toISOString();
  const { error } = await adminSupabase.from("simulations").insert({
    client_id: clientId,
    quote_id: quoteId,
    created_by_app_user_id: adminUser.id,
    title: fields.title,
    status: fields.status,
    client_notes: fields.clientNotes || null,
    requested_at: now
  });

  if (error) {
    return buildSimulationFormError(fields, {}, unexpectedSimulationSaveMessage);
  }

  redirect("/admin/simulacoes?created=1");
}

export async function updateAdminSimulationAction(
  _previousState: SimulationFormState,
  formData: FormData
): Promise<SimulationFormState> {
  await requireAdminActionAccess();
  const fields = readSimulationFields(formData);
  const fieldErrors = validateSimulationFields(fields, {
    requireClient: false,
    requireTitle: false
  });

  if (!fields.id) {
    return buildSimulationFormError(fields, {}, unexpectedSimulationSaveMessage);
  }

  if (hasFieldErrors(fieldErrors)) {
    return buildSimulationFormError(fields, fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("simulations")
    .update({
      status: fields.status,
      client_notes: fields.clientNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", fields.id);

  if (error) {
    return buildSimulationFormError(fields, {}, unexpectedSimulationSaveMessage);
  }

  redirect("/admin/simulacoes?updated=1");
}

export async function createAdminUserAction(
  _previousState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  await requireAdminActionAccess();

  const fields = readAdminUserFields(formData);
  const fieldErrors = validateAdminUserFields(fields, {
    passwordRequired: true
  });

  if (hasFieldErrors(fieldErrors)) {
    return buildAdminUserFormError(fields, fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const duplicatedEmail = await findDuplicatedAppUserEmail(adminSupabase, fields.email);

  if (duplicatedEmail.error) {
    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  if (duplicatedEmail.duplicated) {
    return buildAdminUserFormError(fields, {
      email: duplicateAdminEmailMessage
    });
  }

  const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
    email: fields.email,
    password: fields.password,
    email_confirm: true,
    user_metadata: {
      name: fields.name,
      role: "admin"
    }
  });

  if (createUserError || !createdUser.user) {
    if (isDuplicateEmailError(createUserError)) {
      return buildAdminUserFormError(fields, {
        email: duplicateAdminEmailMessage
      });
    }

    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  const { error: insertAppUserError } = await adminSupabase.from("app_users").insert({
    name: fields.name,
    email: fields.email,
    role: "admin",
    status: fields.status,
    auth_provider: "supabase",
    auth_provider_user_id: createdUser.user.id
  });

  if (insertAppUserError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);

    if (isDuplicateEmailError(insertAppUserError)) {
      return buildAdminUserFormError(fields, {
        email: duplicateAdminEmailMessage
      });
    }

    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  redirect("/admin/usuarios?created=1");
}

export async function updateAdminUserAction(
  _previousState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  await requireAdminActionAccess();

  const fields = readAdminUserFields(formData);
  const fieldErrors = validateAdminUserFields(fields, {
    passwordRequired: false
  });

  if (!fields.userId) {
    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  if (hasFieldErrors(fieldErrors)) {
    return buildAdminUserFormError(fields, fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const duplicatedEmail = await findDuplicatedAppUserEmail(adminSupabase, fields.email, fields.userId);

  if (duplicatedEmail.error) {
    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  if (duplicatedEmail.duplicated) {
    return buildAdminUserFormError(fields, {
      email: duplicateAdminEmailMessage
    });
  }

  const { data: existingUser, error: existingUserError } = await adminSupabase
    .from("app_users")
    .select("id, auth_provider, auth_provider_user_id")
    .eq("id", fields.userId)
    .eq("role", "admin")
    .is("deleted_at", null)
    .maybeSingle();

  if (existingUserError || !existingUser) {
    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  if (existingUser.auth_provider === "supabase" && existingUser.auth_provider_user_id) {
    const updatePayload: {
      email: string;
      password?: string;
      user_metadata: {
        name: string;
        role: string;
      };
    } = {
      email: fields.email,
      user_metadata: {
        name: fields.name,
        role: "admin"
      }
    };

    if (fields.password) {
      updatePayload.password = fields.password;
    }

    const { error: updateAuthUserError } = await adminSupabase.auth.admin.updateUserById(
      existingUser.auth_provider_user_id,
      updatePayload
    );

    if (updateAuthUserError) {
      if (isDuplicateEmailError(updateAuthUserError)) {
        return buildAdminUserFormError(fields, {
          email: duplicateAdminEmailMessage
        });
      }

      return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
    }
  }

  const { error } = await adminSupabase
    .from("app_users")
    .update({
      name: fields.name,
      email: fields.email,
      status: fields.status,
      updated_at: new Date().toISOString()
    })
    .eq("id", fields.userId)
    .eq("role", "admin")
    .is("deleted_at", null);

  if (error) {
    if (isDuplicateEmailError(error)) {
      return buildAdminUserFormError(fields, {
        email: duplicateAdminEmailMessage
      });
    }

    return buildAdminUserFormError(fields, {}, unexpectedAdminUserSaveMessage);
  }

  redirect("/admin/usuarios?updated=1");
}

export async function deactivateAdminUserAction(formData: FormData) {
  const currentAdmin = await requireAdminActionAccess();
  const userId = String(formData.get("userId") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (!userId) {
    redirect("/admin/usuarios?error=missing-user");
  }

  if (userId === currentAdmin.id) {
    redirect(buildSafeAdminUsersRedirect(redirectTo, "selfDeactivate"));
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("app_users")
    .update({
      status: "inactive",
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .eq("role", "admin")
    .is("deleted_at", null);

  if (error) {
    redirect(`/admin/usuarios?error=${encodeURIComponent(error.message)}`);
  }

  redirect(buildSafeAdminUsersRedirect(redirectTo, "deactivated"));
}

export async function reactivateAdminUserAction(formData: FormData) {
  await requireAdminActionAccess();
  const userId = String(formData.get("userId") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (!userId) {
    redirect("/admin/usuarios?error=missing-user");
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("app_users")
    .update({
      status: "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .eq("role", "admin")
    .is("deleted_at", null);

  if (error) {
    redirect(`/admin/usuarios?error=${encodeURIComponent(error.message)}`);
  }

  redirect(buildSafeAdminUsersRedirect(redirectTo, "reactivated"));
}
