
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Youtube, 
  TiktokIcon, 
  MessageSquare,
  Link2,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Create a TikTok icon since it's not in lucide-react
const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="M16 8v8a5 5 0 0 1-5 5v0a5 5 0 0 1-5-5v0" />
    <path d="M22 2h-6v16" />
  </svg>
);

type SocialPlatform = {
  id: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
  username?: string;
};

const SocialConnections = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    { id: "instagram", name: "Instagram", icon: Instagram, connected: false },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, connected: false },
    { id: "facebook", name: "Facebook", icon: Facebook, connected: false },
    { id: "twitter", name: "Twitter", icon: Twitter, connected: false },
    { id: "youtube", name: "YouTube", icon: Youtube, connected: false },
    { id: "tiktok", name: "TikTok", icon: TiktokIcon, connected: false },
    { id: "whatsapp", name: "WhatsApp", icon: MessageSquare, connected: false },
  ]);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    apiKey: "",
  });
  
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const connectPlatform = () => {
    if (!selectedPlatform) return;
    
    // In a real app, this would be an API call to connect to the platform
    // This is just a simulation
    setTimeout(() => {
      setPlatforms(prev => 
        prev.map(p => 
          p.id === selectedPlatform.id 
            ? { ...p, connected: true, username: formData.username } 
            : p
        )
      );
      
      toast({
        title: "Connected Successfully",
        description: `Your ${selectedPlatform.name} account has been connected.`,
      });
      
      setSelectedPlatform(null);
      setFormData({ username: "", password: "", apiKey: "" });
    }, 1000);
  };
  
  const disconnectPlatform = (id: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === id ? { ...p, connected: false, username: undefined } : p
      )
    );
    
    toast({
      title: "Disconnected",
      description: `Your ${platforms.find(p => p.id === id)?.name} account has been disconnected.`,
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Connections</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Connect your social media accounts for automated posting
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Card key={platform.id} className={platform.connected ? "border-green-200 dark:border-green-900" : ""}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{platform.name}</CardTitle>
                    {platform.connected && (
                      <CardDescription className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected as @{platform.username}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardFooter>
                {platform.connected ? (
                  <div className="flex w-full space-x-2">
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => disconnectPlatform(platform.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setSelectedPlatform(platform)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Account
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {selectedPlatform && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Connect {selectedPlatform.name}</CardTitle>
            <CardDescription>
              Enter your credentials to connect your {selectedPlatform.name} account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                placeholder={`Your ${selectedPlatform.name} username`}
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your credentials are securely encrypted and never stored
              </p>
            </div>
            
            {(selectedPlatform.id === "instagram" || selectedPlatform.id === "facebook") && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input 
                  id="apiKey" 
                  name="apiKey" 
                  placeholder="For advanced features"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedPlatform(null)}>
              Cancel
            </Button>
            <Button 
              onClick={connectPlatform}
              disabled={!formData.username || !formData.password}
            >
              Connect Account
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SocialConnections;
