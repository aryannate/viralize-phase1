
import { Home, Video, Mic, Share2, Calendar, BarChart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "avatar", label: "AI Avatar", icon: Video },
  { id: "voice", label: "Voice Refinement", icon: Mic },
  { id: "social", label: "Social Accounts", icon: Share2 },
  { id: "posts", label: "Post Automation", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <div className="w-64 hidden md:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          InfluencerAI
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <a href="/" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Home
          </a>
        </Button>
        
        <div className="pt-4 pb-2">
          <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Platform
          </p>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-gray-100 dark:bg-gray-700"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
