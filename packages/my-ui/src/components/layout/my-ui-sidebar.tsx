import type { ReactNode } from "react";
import { cn } from "my-ui/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "my-ui/ui/sidebar";

export type MyUiSidebarItem = {
  // React key; defaults to title, so set it when titles can repeat
  id?: string;
  title: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: ReactNode;
};

type MyUiSidebarLayoutProps = {
  sections: { label?: ReactNode; items: MyUiSidebarItem[] }[];
  header?: ReactNode;
  footer?: ReactNode;
  // Shown in the top bar next to the sidebar toggle, e.g. the page title and actions
  topBar?: ReactNode;
  topBarClassName?: string;
  // Page content next to the sidebar
  children: ReactNode;
  defaultOpen?: boolean;
};

// One menu entry; on mobile the sidebar is a drawer, so choosing an entry closes it
function SidebarItemButton({ item }: { item: MyUiSidebarItem }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenuButton
      asChild={!!item.href}
      isActive={item.isActive}
      tooltip={item.title}
      onClick={() => {
        item.onClick?.();
        if (isMobile) setOpenMobile(false);
      }}
    >
      {item.href ? (
        <a href={item.href}>
          {item.icon}
          <span>{item.title}</span>
        </a>
      ) : (
        <>
          {item.icon}
          <span>{item.title}</span>
        </>
      )}
    </SidebarMenuButton>
  );
}

// App shell: collapsible sidebar with grouped links, plus the page content
export function MyUiSidebarLayout({
  sections,
  header,
  footer,
  topBar,
  topBarClassName,
  children,
  defaultOpen,
}: MyUiSidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        {header && <SidebarHeader>{header}</SidebarHeader>}
        <SidebarContent>
          {sections.map((section, sectionIndex) => (
            <SidebarGroup key={sectionIndex}>
              {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.id ?? item.title}>
                      <SidebarItemButton item={item} />
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {footer && <SidebarFooter>{footer}</SidebarFooter>}
      </Sidebar>
      <SidebarInset>
        <header
          className={cn("sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background px-3", topBarClassName)}
        >
          <SidebarTrigger />
          {topBar}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
