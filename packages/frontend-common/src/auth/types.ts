// The signed-in account as the auth service returns it
export type AuthAccount = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  // Profile photo path relative to the auth API, empty when none
  image: string;
};

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export type AuthSnapshot = {
  status: AuthStatus;
  user: AuthAccount | null;
  // JWT every API call sends as "Authorization: Bearer <token>"; empty while signed out
  token: string;
};

export type SignInPayload = { email: string; password: string };

export type SignUpPayload = SignInPayload & { name: string };

export type SignInReply = { user: AuthAccount; token: string; expiresAt: number };
