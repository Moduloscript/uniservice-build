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
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar()
  
  const isActiveMenuItem = (href: string) => pathname.includes(href)

  return (
    <>
      {/* Mobile backdrop overlay */}
      {openMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden"
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}
    <Sidebar 
      collapsible="icon"
      className={cn(
        /* Base styles for all screens */
        "transition-all duration-300 ease-in-out",
        /* Mobile: Fixed position overlay */
        "fixed inset-y-0 left-0 z-50 w-64 transform",
        "md:relative md:z-auto md:translate-x-0",
        /* Show/hide based on mobile state */
        openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <SidebarHeader className={cn(
        "border-b border-sidebar-border transition-all duration-200",
        open ? "p-4" : "p-2 justify-center"
      )}>
        {menuItems.map((item, i) => (
          <div key={i} className={cn(
            "flex items-center transition-all duration-200",
            open ? "gap-2" : "justify-center"
          )}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
              {item.avatar}
            </div>
            {open && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{item.title}</span>
                <span className="truncate text-xs text-sidebar-muted-foreground">Panel</span>
              </div>
            )}
          </div>
        ))}
      </SidebarHeader>
      
      <SidebarContent className={cn(
        "transition-all duration-200",
        /* Mobile: Always show full labels when open */
        "sm:p-2",
        /* Desktop: Responsive padding based on open state */
        open ? "md:p-2" : "md:p-1"
      )}>
        {menuItems.map((item, i) => (
          <SidebarGroup key={i} className={cn(
            "transition-all duration-200",
            open ? "mb-4" : "mb-2"
          )}>
            {/* Mobile: Always show labels, Desktop: Only when open */}
            <SidebarGroupLabel className={cn(
              "sm:block", /* Always visible on mobile */
              open ? "md:block" : "md:hidden" /* Conditional on desktop */
            )}>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subitem, k) => (
                  <SidebarMenuItem key={k}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveMenuItem(subitem.href)}
                      className={cn(
                        "transition-all duration-200",
                        /* Mobile: Always full width with labels */
                        "sm:justify-start sm:px-3 sm:py-3 sm:min-h-[44px]", /* 44px touch target */
                        /* Desktop: Responsive based on open state */
                        open ? "md:justify-start md:px-2" : "md:justify-center md:px-1 md:size-8"
                      )}
                    >
                      <Link 
                        href={subitem.href}
                        className={cn(
                          "flex items-center transition-all duration-200",
                          open ? "gap-2" : "justify-center"
                        )}
                        title={!open ? subitem.title : undefined}
                      >
                        <span className="shrink-0">
                          {subitem.icon}
                        </span>
                        {open && <span>{subitem.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
    </>
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
