import { ReactNode } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/mothers': 'Mothers',
    '/newborns': 'Newborns',
    '/qr-verification': 'QR Verification',
    '/screenings': 'Screenings',
    '/maternal-assessments': 'Maternal Assessments',
    '/discharge': 'Discharge',
    '/analytics': 'Analytics',
    '/notifications': 'Notifications',
    '/activity-logs': 'Activity Logs',
    '/users': 'Users',
    '/profile': 'My Profile',
  };
  return titles[pathname] || 'SafeMatch';
};

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-teal-200 bg-teal-700 w-full">
          <div className="flex items-center gap-2 px-4 w-full overflow-x-hidden">
            <SidebarTrigger className="-ml-1 text-white hover:bg-teal-600 flex-shrink-0" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-teal-500 flex-shrink-0"
            />
            <Breadcrumb className="overflow-x-hidden">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-teal-100 hover:text-white">
                    SafeMatch
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-teal-300" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-semibold truncate">
                    {pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 bg-gradient-to-br from-teal-50 to-green-50 min-h-screen w-full overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
