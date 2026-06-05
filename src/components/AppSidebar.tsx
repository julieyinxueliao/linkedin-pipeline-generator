import { LayoutDashboard, Calendar, PenSquare, FileText, Settings, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
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
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Calendar', url: '/schedule', icon: Calendar },
  { title: 'My Posts', url: '/posts', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const profile = useAppStore((s) => s.profile);
  const { signOut, user } = useAuth();
  const initials = profile.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-linkedin flex items-center justify-center shrink-0">
            <span className="text-linkedin-foreground text-xs font-black">B</span>
          </div>
          {!collapsed && <span className="font-black text-sm text-sidebar-foreground tracking-tight">Brand Builder</span>}
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
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
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
      <div className="mt-auto p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-linkedin/15 flex items-center justify-center text-linkedin text-xs font-black shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile.name || user?.email || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">{profile.role || 'Getting started'}</p>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={signOut}>
          <LogOut className="h-3.5 w-3.5 mr-2" />
          {!collapsed && 'Sign out'}
        </Button>
      </div>
    </Sidebar>
  );
}
