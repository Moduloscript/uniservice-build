"use client"

import { cn } from "@ui/lib"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar 
} from "@ui/components/sidebar"

type MenuItem = {
  title: string
  avatar: ReactNode
  items: {
    title: string
    href: string
    icon?: ReactNode
  }[]
}

type CollapsibleSettingsMenuProps = {
  menuItems: MenuItem[]
}

export function CollapsibleSettingsMenu({ menuItems }: CollapsibleSettingsMenuProps) {
  const pathname = usePathname()
  
  const isActiveMenuItem = (href: string) => pathname.includes(href)

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        {menuItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {item.avatar}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{item.title}</span>
              <span className="truncate text-xs text-sidebar-muted-foreground">Administration</span>
            </div>
          </div>
        ))}
      </SidebarHeader>
      
      <SidebarContent>
        {menuItems.map((item, i) => (
          <SidebarGroup key={i}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subitem, k) => (
                  <SidebarMenuItem key={k}>
                    <SidebarMenuButton asChild isActive={isActiveMenuItem(subitem.href)}>
                      <Link href={subitem.href}>
                        {subitem.icon}
                        <span>{subitem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

// Backward compatible wrapper that maintains the existing interface
export function SettingsMenuWrapper({ 
  menuItems, 
  className 
}: {
  menuItems: MenuItem[]
  className?: string
}) {
  const pathname = usePathname()
  const isActiveMenuItem = (href: string) => pathname.includes(href)

  return (
    <div className={cn("space-y-8", className)}>
      {menuItems.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-start gap-2">
            {item.avatar}
            <h2 className="font-semibold text-foreground/60 text-xs">
              {item.title}
            </h2>
          </div>

          <ul className="mt-2 flex list-none flex-row gap-6 lg:mt-4 lg:flex-col lg:gap-2">
            {item.items.map((subitem, k) => (
              <li key={k}>
                <Link
                  href={subitem.href}
                  className={cn(
                    "lg:-ml-0.5 flex items-center gap-2 border-b-2 py-1.5 text-sm lg:border-b-0 lg:border-l-2 lg:pl-2",
                    isActiveMenuItem(subitem.href)
                      ? "border-primary font-bold"
                      : "border-transparent"
                  )}
                  data-active={isActiveMenuItem(subitem.href)}
                >
                  <span className="shrink-0">
                    {subitem.icon}
                  </span>
                  <span>{subitem.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
