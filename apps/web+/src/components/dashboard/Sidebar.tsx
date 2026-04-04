// src/components/dashboard/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Film, 
  Clapperboard, 
  Video, 
  Tv, 
  Mic, 
  Music, 
  Theater,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Movies", path: "/movies", icon: <Film className="h-5 w-5" /> },
  { label: "Reel Films", path: "/reelfilms", icon: <Clapperboard className="h-5 w-5" /> },
  { label: "Miniseries", path: "/miniseries", icon: <Video className="h-5 w-5" /> },
  { label: "TV Shows", path: "/tvshows", icon: <Tv className="h-5 w-5" /> },
  { label: "Podcasts", path: "/podcasts", icon: <Mic className="h-5 w-5" /> },
  { label: "Music", path: "/music", icon: <Music className="h-5 w-5" /> },
  { label: "Stage Plays", path: "/stageplays", icon: <Theater className="h-5 w-5" /> },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Reel Afrika
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Studio Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={logout}
          className="w-full justify-start border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;