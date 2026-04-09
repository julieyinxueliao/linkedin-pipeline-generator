import { LayoutDashboard, Calendar, PenSquare, FileText, Settings, Linkedin } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Schedule', url: '/schedule', icon: Calendar },
  { title: 'Draft a Post', url: '/draft', icon: PenSquare },
  { title: 'My Posts', url: '/posts', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5 flex items-center gap-2">
          <Linkedin className="h-6 w-6 text-linkedin shrink-0" />
          {!collapsed && <span className="font-bold text-sm text-sidebar-foreground tracking-tight">Brand Builder</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-linkedin/20 flex items-center justify-center text-linkedin text-xs font-bold shrink-0">JD</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Jane Doe</p>
              <p className="text-xs text-muted-foreground truncate">CEO, Acme Inc</p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
