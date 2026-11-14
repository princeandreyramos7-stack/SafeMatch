import * as React from "react"
import {
  Home,
  Users,
  Baby,
  QrCode,
  ClipboardCheck,
  FileText,
  LogOut,
  ChevronUp,
  User2,
  Activity,
  Shield,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Mothers",
    url: "/mothers",
    icon: Users,
  },
  {
    title: "Newborns",
    url: "/newborns",
    icon: Baby,
  },
  {
    title: "QR Verification",
    url: "/qr-verification",
    icon: QrCode,
  },
  {
    title: "Screenings",
    url: "/screenings",
    icon: ClipboardCheck,
  },
  {
    title: "Discharge",
    url: "/discharge",
    icon: FileText,
  },
  {
    title: "Activity Logs",
    url: "/activity-logs",
    icon: Activity,
  },
  {
    title: "Users",
    url: "/users",
    icon: Shield,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-teal-800" {...props}>
      <SidebarHeader className="bg-teal-900 border-b border-teal-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <Baby className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-white">SafeMatch</span>
                  <span className="text-xs text-teal-300">Mother-Baby ID</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-teal-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-300">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 text-teal-100 hover:text-white hover:bg-teal-800"
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-teal-900 border-t border-teal-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-teal-800 data-[state=open]:text-white hover:bg-teal-800 hover:text-white"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-teal-100">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-teal-300">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-teal-300" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User2 className="mr-2 size-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
