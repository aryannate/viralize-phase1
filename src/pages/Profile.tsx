
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Briefcase, Heart, Tag } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    audienceType: "",
    audienceAge: "",
    audienceSize: "",
    niche: "",
    interests: "",
    brandCollaborations: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile via API
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated.",
    });
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <form onSubmit={handleSave}>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                />
              </div>
              
              {/* Influencer-specific fields */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Content Niche
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="niche">Primary Niche</Label>
                  <Select 
                    value={profileData.niche} 
                    onValueChange={(value) => handleSelectChange("niche", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary content category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">Fashion & Style</SelectItem>
                      <SelectItem value="beauty">Beauty & Makeup</SelectItem>
                      <SelectItem value="fitness">Fitness & Health</SelectItem>
                      <SelectItem value="food">Food & Cooking</SelectItem>
                      <SelectItem value="travel">Travel & Adventure</SelectItem>
                      <SelectItem value="tech">Technology & Gadgets</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="finance">Finance & Investing</SelectItem>
                      <SelectItem value="education">Education & Learning</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="parenting">Parenting & Family</SelectItem>
                      <SelectItem value="business">Business & Entrepreneurship</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="interests">Interests & Topics</Label>
                  <Textarea
                    id="interests"
                    name="interests"
                    placeholder="List the specific topics, trends, or subjects you cover (e.g., sustainable fashion, home workouts, budget travel)"
                    value={profileData.interests}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Audience Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audienceType">Audience Type</Label>
                    <Select 
                      value={profileData.audienceType} 
                      onValueChange={(value) => handleSelectChange("audienceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General/Mixed</SelectItem>
                        <SelectItem value="professionals">Professionals</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="parents">Parents</SelectItem>
                        <SelectItem value="enthusiasts">Enthusiasts/Hobbyists</SelectItem>
                        <SelectItem value="experts">Industry Experts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="audienceAge">Primary Age Group</Label>
                    <Select 
                      value={profileData.audienceAge} 
                      onValueChange={(value) => handleSelectChange("audienceAge", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="13-17">13-17</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55+">55+</SelectItem>
                        <SelectItem value="mixed">Mixed/All Ages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="audienceSize">Audience Size</Label>
                  <Select 
                    value={profileData.audienceSize} 
                    onValueChange={(value) => handleSelectChange("audienceSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your follower count range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nano">Nano (1K-10K followers)</SelectItem>
                      <SelectItem value="micro">Micro (10K-50K followers)</SelectItem>
                      <SelectItem value="mid">Mid-tier (50K-500K followers)</SelectItem>
                      <SelectItem value="macro">Macro (500K-1M followers)</SelectItem>
                      <SelectItem value="mega">Mega (1M+ followers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Brand Collaborations
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="brandCollaborations">Past & Current Collaborations</Label>
                  <Textarea
                    id="brandCollaborations"
                    name="brandCollaborations"
                    placeholder="List brands you've worked with and types of collaborations (e.g., sponsored posts, brand ambassador, product reviews)"
                    value={profileData.brandCollaborations}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit" className="ml-auto">
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Avatar</CardTitle>
              <CardDescription>
                Manage your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full">Change Avatar</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Interests & Expertise
              </CardTitle>
              <CardDescription>
                Highlight your key areas of expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Complete your profile to show brands your expertise and content focus areas.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.interests.split(',').filter(Boolean).map((interest, i) => (
                  <span key={i} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {interest.trim()}
                  </span>
                ))}
                {!profileData.interests && (
                  <span className="text-sm text-muted-foreground italic">
                    Add interests in the form
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
