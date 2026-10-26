import type { AuthAccount, AuthSnapshot, SignInPayload, SignInReply, SignUpPayload } from "./types";

// Keeps the token between visits; cookies ignore the port, so every app on this host shares one sign-in
const TOKEN_COOKIE = "access_token";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type AuthClientOptions = {
  // Auth service API base, e.g. "/auth-api" (proxied by each app)
  baseUrl: string;
};

const readToken = () =>
  document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${TOKEN_COOKIE}=`))
    ?.slice(TOKEN_COOKIE.length + 1) ?? "";

const saveToken = (token: string, expiresAt: number) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${token}; Path=/; SameSite=Strict; Expires=${new Date(expiresAt).toUTCString()}${secure}`;
};

const deleteToken = () => {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0`;
};

// Sign-in state for one app: log in or register for a JWT, then every API call sends it as a bearer token
export const createAuthClient = ({ baseUrl }: AuthClientOptions) => {
  const base = baseUrl.replace(/\/$/, "");
  const listeners = new Set<() => void>();
  let snapshot: AuthSnapshot = { status: "loading", user: null, token: "" };

  const emit = (next: AuthSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const request = async <T>(
    path: string,
    init: { method?: string; body?: unknown; token?: string } = {},
  ): Promise<T> => {
    const headers: Record<string, string> = { Accept: "application/json" };
    // FormData sets its own multipart Content-Type
    const isForm = init.body instanceof FormData;
    if (init.body !== undefined && !isForm) headers["Content-Type"] = "application/json";
    if (init.token) headers.Authorization = `Bearer ${init.token}`;
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method: init.method ?? (init.body === undefined ? "GET" : "POST"),
        headers,
        body: init.body === undefined ? undefined : isForm ? (init.body as FormData) : JSON.stringify(init.body),
      });
    } catch {
      throw new AuthError("Cannot reach the sign-in service", 0);
    }
    const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!response.ok) throw new AuthError(data?.error || `Request failed (${response.status})`, response.status);
    return data as T;
  };

  const signedIn = ({ user, token, expiresAt }: SignInReply) => {
    saveToken(token, expiresAt);
    emit({ status: "signedIn", user, token });
  };

  // Forgets the token; the next API call has none, so nothing stays signed in
  const signOut = () => {
    deleteToken();
    emit({ status: "signedOut", user: null, token: "" });
  };

  // On start: a saved token is checked with the auth service (expired or unknown means signed out)
  const restore = async () => {
    const token = readToken();
    if (!token) return signOut();
    try {
      const user = await request<AuthAccount>("/auth/me", { token });
      emit({ status: "signedIn", user, token });
    } catch {
      signOut();
    }
  };

  const signIn = async (payload: SignInPayload) =>
    signedIn(await request<SignInReply>("/auth/login", { body: payload }));

  const signUp = async (payload: SignUpPayload) =>
    signedIn(await request<SignInReply>("/auth/register", { body: payload }));

  // Account changes return the updated account
  const updateUser = (user: AuthAccount) => emit({ ...snapshot, user });

  const uploadAvatar = async (photo: File) => {
    const form = new FormData();
    form.append("photo", photo);
    updateUser(await request<AuthAccount>("/account/avatar", { body: form, token: snapshot.token }));
  };

  const removeAvatar = async () =>
    updateUser(await request<AuthAccount>("/account/avatar", { method: "DELETE", token: snapshot.token }));

  const deleteAccount = async (password: string) => {
    await request("/account", { method: "DELETE", body: { password }, token: snapshot.token });
    signOut();
  };

  // Full URL of a profile photo path from the auth service
  const avatarUrl = (image?: string | null) => (image ? `${base}${image}` : undefined);

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    // The bearer token for API calls
    getToken: () => snapshot.token,
    restore,
    signIn,
    signUp,
    signOut,
    avatarUrl,
    uploadAvatar,
    removeAvatar,
    deleteAccount,
  };
};

export type AuthClient = ReturnType<typeof createAuthClient>;
