
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AvatarSetup from "@/components/dashboard/AvatarSetup";
import VoiceSetup from "@/components/dashboard/VoiceSetup";
import SocialConnections from "@/components/dashboard/SocialConnections";
import PostAutomation from "@/components/dashboard/PostAutomation";
import Sidebar from "@/components/dashboard/Sidebar";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("avatar");
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="avatar" className="mt-0">
              <AvatarSetup />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-0">
              <VoiceSetup />
            </TabsContent>
            
            <TabsContent value="social" className="mt-0">
              <SocialConnections />
            </TabsContent>
            
            <TabsContent value="posts" className="mt-0">
              <PostAutomation />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
