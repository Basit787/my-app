import { Kbd, KbdGroup } from "my-ui/ui/kbd";

type MyUiKbdProps = { keys: string[]; className?: string };

// Keyboard shortcut, e.g. keys={["⌘", "K"]}
export function MyUiKbd({ keys, className }: MyUiKbdProps) {
  return (
    <KbdGroup className={className}>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  );
}
