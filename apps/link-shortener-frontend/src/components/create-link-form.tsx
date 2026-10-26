import { Link2 } from "lucide-react";
import { MyUiCard, useAppForm } from "my-ui";
import { useCreateLink } from "@/features/links/api/hooks";
import { createLinkFormSchema } from "@/features/links/validation/create-link-form-schema";

type CreateLinkFormProps = { onCreated?: () => void };

export const CreateLinkForm = ({ onCreated }: CreateLinkFormProps) => {
  const createLink = useCreateLink();
  // Validated on every change; Shorten stays disabled until the URL is valid
  const form = useAppForm({
    defaultValues: { url: "", slug: "", title: "" },
    validators: { onChange: createLinkFormSchema },
    onSubmit: ({ value, formApi }) => {
      const input = {
        url: value.url.trim(),
        slug: value.slug || undefined,
        title: value.title.trim() || undefined,
      };
      createLink.mutate(input, {
        onSuccess: () => {
          formApi.reset();
          onCreated?.();
        },
      });
    },
  });

  return (
    <MyUiCard
      title="Shorten a link"
      description="Paste a long URL; pick a custom short path or get a random one."
      className="max-md:border-0 max-md:bg-transparent max-md:py-0 max-md:shadow-none max-md:*:px-0"
    >
      <form.AppForm>
        <form.Form className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-start">
          <form.AppField name="url">
            {(field) => (
              <field.TextField
                label="Long URL"
                placeholder="https://example.com/a/very/long/path"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
              />
            )}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => (
              <field.TextField label="Custom path" placeholder="optional" autoCapitalize="none" autoCorrect="off" />
            )}
          </form.AppField>
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" placeholder="optional" />}
          </form.AppField>
          <form.SubmitButton
            loading={createLink.isPending}
            icon={<Link2 />}
            className="w-full md:mt-[1.375rem] md:w-auto"
          >
            Shorten
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </MyUiCard>
  );
};
