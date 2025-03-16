
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Hash, RefreshCw, MessageSquare, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import HashtagGenerator from "@/components/content-tools/HashtagGenerator";
import CaptionGenerator from "@/components/content-tools/CaptionGenerator";
import ContentRepurposer from "@/components/content-tools/ContentRepurposer";
import CommentResponder from "@/components/content-tools/CommentResponder";
import MonetizationInsights from "@/components/content-tools/MonetizationInsights";

const ContentTools = () => {
  const [activeTab, setActiveTab] = useState("hashtags");
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar activeTab="tools" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">AI Content Tools</h1>
            <p className="text-muted-foreground mt-2">
              Leverage AI to create compelling content for your audience
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="hashtags" className="flex items-center gap-2">
                <Hash className="h-4 w-4" /> Hashtags
              </TabsTrigger>
              <TabsTrigger value="captions" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Captions
              </TabsTrigger>
              <TabsTrigger value="repurpose" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Repurpose
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Comments
              </TabsTrigger>
              <TabsTrigger value="monetize" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Monetize
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hashtags" className="mt-0">
              <HashtagGenerator />
            </TabsContent>
            
            <TabsContent value="captions" className="mt-0">
              <CaptionGenerator />
            </TabsContent>
            
            <TabsContent value="repurpose" className="mt-0">
              <ContentRepurposer />
            </TabsContent>
            
            <TabsContent value="comments" className="mt-0">
              <CommentResponder />
            </TabsContent>
            
            <TabsContent value="monetize" className="mt-0">
              <MonetizationInsights />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ContentTools;
