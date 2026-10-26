import { MyUiBreadcrumb } from "my-ui";
import { serviceUrl } from "ports";

type AppBreadcrumbsProps = {
  // Current app, e.g. "Chat"; leave out on the home launcher itself
  app?: string;
  // Page inside the app, e.g. "Gallery"
  page?: string;
  className?: string;
};

// Home › App › Page; every part but the last is a link
export const AppBreadcrumbs = ({ app, page, className }: AppBreadcrumbsProps) => {
  const items: { label: string; href?: string }[] = [{ label: "Home", href: serviceUrl("home", "frontend") }];
  if (app) items.push({ label: app, href: "/" });
  if (page) items.push({ label: page });
  return <MyUiBreadcrumb items={items} className={className} />;
};
