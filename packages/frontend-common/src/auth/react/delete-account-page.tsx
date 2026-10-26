import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button, useAppForm } from "my-ui";
import { legalUrl } from "../../legal/legal-url";
import { useDeleteAccount } from "./use-delete-account";

type DeleteAccountPageProps = { onBack: () => void };

const DELETED_DATA = ["Your sign-in for every app", "Your name, email and profile photo"];

// Replaces the settings while open: warns what goes, then asks for the password and an explicit confirmation
export const DeleteAccountPage = ({ onBack }: DeleteAccountPageProps) => {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const form = useAppForm({
    defaultValues: { password: "", understood: false },
    // Form-level, so Delete stays disabled until both the password and the tick are there
    validators: {
      onChange: ({ value }) => ({
        fields: {
          password: value.password ? undefined : "Enter your password to confirm",
          understood: value.understood ? undefined : "Tick the box to confirm",
        },
      }),
    },
    onSubmit: ({ value }) => deleteAccount(value.password),
  });

  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" size="sm" className="-ml-2 gap-2" onClick={onBack} disabled={isPending}>
        <ArrowLeft />
        Back to settings
      </Button>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <h3 className="text-base font-semibold text-destructive">Delete your account?</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">This permanently deletes your account:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {DELETED_DATA.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-medium text-destructive">This cannot be undone.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          See the{" "}
          <a href={legalUrl("privacy")} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Privacy Policy
          </a>{" "}
          for how your data is handled.
        </p>
      </div>

      <form.AppForm>
        <form.Form className="space-y-3">
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField placeholder="Enter your password to confirm" autoComplete="current-password" />
            )}
          </form.AppField>
          <form.AppField name="understood">
            {(field) => <field.CheckboxField label="I understand that my account will be deleted for good" />}
          </form.AppField>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onBack} disabled={isPending}>
              Cancel
            </Button>
            <form.SubmitButton variant="destructive" className="flex-1 rounded-xl" loading={isPending}>
              {isPending ? "Deleting…" : "Delete account"}
            </form.SubmitButton>
          </div>
        </form.Form>
      </form.AppForm>
    </div>
  );
};
