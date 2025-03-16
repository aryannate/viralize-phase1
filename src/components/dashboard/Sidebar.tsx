
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bot, Grid3X3, Video, Mic, Users, Hash, DollarSign, Handshake } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    {
      name: "Dashboard",
      icon: <Grid3X3 className="h-5 w-5" />,
      value: "dashboard",
      path: "/dashboard"
    },
    {
      name: "AI Avatar",
      icon: <Bot className="h-5 w-5" />,
      value: "avatar",
      path: "/avatar-training"
    },
    {
      name: "Voice",
      icon: <Mic className="h-5 w-5" />,
      value: "voice",
      path: "/dashboard"
    },
    {
      name: "Social",
      icon: <Users className="h-5 w-5" />,
      value: "social",
      path: "/dashboard"
    },
    {
      name: "Content Tools",
      icon: <Hash className="h-5 w-5" />,
      value: "tools",
      path: "/content-tools"
    },
    {
      name: "Posts",
      icon: <Video className="h-5 w-5" />,
      value: "posts",
      path: "/dashboard"
    },
    {
      name: "Monetization",
      icon: <DollarSign className="h-5 w-5" />,
      value: "monetize",
      path: "/dashboard"
    },
    {
      name: "Collaborations",
      icon: <Handshake className="h-5 w-5" />,
      value: "collaborations",
      path: "/collaborations"
    }
  ];
  
  const handleTabChange = (tabValue: string, path: string) => {
    setActiveTab(tabValue);
    navigate(path);
  };

  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Viralize</h2>
        <p className="text-sm text-muted-foreground">AI-Powered Social Automation</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.value}
            onClick={() => handleTabChange(item.value, item.path)}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              activeTab === item.value ? "bg-muted" : "hover:bg-transparent hover:underline"
            )}
          >
            {item.icon}
            <span className="ml-2">{item.name}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-medium text-primary">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
