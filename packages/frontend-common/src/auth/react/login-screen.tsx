import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, useAppForm } from "my-ui";
import { Loader2, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LegalLinks } from "../../legal/legal-links";
import { legalUrl } from "../../legal/legal-url";
import { useAuthClient } from "./use-auth";

export type LoginScreenProps = { appName?: string; logo?: ReactNode; headerRight?: ReactNode };

const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

// The one sign-in / sign-up screen every app shows
export const LoginScreen = ({ appName = "ChatWave", logo, headerRight }: LoginScreenProps) => {
  const client = useAuthClient();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const signingUp = mode === "signUp";

  const form = useAppForm({
    defaultValues: { name: "", email: "", password: "", confirm: "", accepted: false },
    // Re-read every render, so switching between sign-in and sign-up changes what is required
    validators: {
      onChange: ({ value }) => ({
        fields: {
          name: signingUp && !value.name.trim() ? "Choose a username" : undefined,
          email: value.email.trim() ? undefined : "Enter your email",
          password: !value.password
            ? "Enter your password"
            : signingUp && value.password.length < 8
              ? "Password must be at least 8 characters"
              : undefined,
          confirm: signingUp && value.confirm !== value.password ? "Passwords do not match" : undefined,
          accepted:
            signingUp && !value.accepted ? "Accept the Terms of Service and Privacy Policy to continue" : undefined,
        },
      }),
    },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        if (signingUp)
          await client.signUp({ name: value.name.trim(), email: value.email.trim(), password: value.password });
        else await client.signIn({ email: value.email.trim(), password: value.password });
      } catch (e) {
        setError(errorText(e, signingUp ? "Could not create account" : "Could not sign in"));
      }
    },
  });

  const switchMode = () => {
    setMode(signingUp ? "signIn" : "signUp");
    setError("");
  };

  return (
    <div className="relative flex min-h-dvh bg-background">
      {headerRight && <div className="absolute top-4 right-4 z-10">{headerRight}</div>}
      <div className="flex min-h-dvh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              {logo ?? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <MessageCircle className="h-6 w-6" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">Welcome to {appName}</CardTitle>
                <CardDescription>{signingUp ? "Create your account" : "Sign in to continue"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form.AppForm>
              <form.Form className="space-y-4">
                {signingUp && (
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Username"
                        placeholder="Your name"
                        autoComplete="username"
                        className="[&_input]:rounded-xl"
                      />
                    )}
                  </form.AppField>
                )}
                <form.AppField name="email">
                  {(field) => (
                    <field.TextField
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="[&_input]:rounded-xl"
                    />
                  )}
                </form.AppField>
                <form.AppField name="password">
                  {(field) => (
                    <field.PasswordField
                      label="Password"
                      placeholder={signingUp ? "At least 8 characters" : "Enter your password"}
                      autoComplete={signingUp ? "new-password" : "current-password"}
                      className="[&_input]:rounded-xl"
                    />
                  )}
                </form.AppField>
                {signingUp && (
                  <form.AppField name="confirm">
                    {(field) => (
                      <field.PasswordField
                        label="Confirm password"
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className="[&_input]:rounded-xl"
                      />
                    )}
                  </form.AppField>
                )}
                {signingUp && (
                  <form.AppField name="accepted">
                    {(field) => (
                      <field.CheckboxField
                        label={
                          <span className="font-normal text-muted-foreground">
                            I agree to the{" "}
                            <a
                              href={legalUrl("terms")}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href={legalUrl("privacy")}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </span>
                        }
                      />
                    )}
                  </form.AppField>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {/* Not form.SubmitButton: browsers can autofill sign-in without a change event */}
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {signingUp ? "Create account" : "Sign in"}
                    </Button>
                  )}
                </form.Subscribe>
                <Button type="button" variant="outline" className="w-full rounded-xl" onClick={switchMode}>
                  {signingUp ? "Already have an account? Sign in" : "Create an account"}
                </Button>
              </form.Form>
            </form.AppForm>
            <LegalLinks className="mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
