
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CalendarIcon, 
  Clock, 
  ImageIcon, 
  Check, 
  PlusCircle, 
  Bot, 
  Calendar as CalendarIcon2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type Platform = "instagram" | "linkedin" | "twitter" | "facebook";

type PostDraft = {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledDate?: Date;
  mediaIncluded: boolean;
  status: "draft" | "scheduled" | "published";
};

const platformIcons = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
};

const PostAutomation = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostDraft[]>([
    {
      id: "1",
      content: "Excited to announce our new partnership with #AI technology leaders!",
      platforms: ["instagram", "linkedin", "twitter"],
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
      mediaIncluded: true,
      status: "scheduled",
    },
    {
      id: "2",
      content: "Just wrapped up an amazing podcast about the future of social media automation. Stay tuned!",
      platforms: ["twitter", "linkedin"],
      mediaIncluded: false,
      status: "draft",
    },
  ]);
  
  const [newPost, setNewPost] = useState<Partial<PostDraft>>({
    content: "",
    platforms: [],
    mediaIncluded: false,
    status: "draft",
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isScheduling, setIsScheduling] = useState(false);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPost(prev => ({ ...prev, content: e.target.value }));
  };
  
  const togglePlatform = (platform: Platform) => {
    setNewPost(prev => {
      const platforms = prev.platforms || [];
      return {
        ...prev,
        platforms: platforms.includes(platform)
          ? platforms.filter(p => p !== platform)
          : [...platforms, platform]
      };
    });
  };
  
  const savePost = () => {
    if (!newPost.content || (newPost.platforms || []).length === 0) {
      toast({
        title: "Incomplete post",
        description: "Please add content and select at least one platform.",
        variant: "destructive",
      });
      return;
    }
    
    const postToSave: PostDraft = {
      id: Date.now().toString(),
      content: newPost.content || "",
      platforms: newPost.platforms || [],
      scheduledDate: selectedDate,
      mediaIncluded: newPost.mediaIncluded || false,
      status: isScheduling && selectedDate ? "scheduled" : "draft",
    };
    
    setPosts(prev => [...prev, postToSave]);
    
    toast({
      title: isScheduling ? "Post Scheduled" : "Draft Saved",
      description: isScheduling 
        ? `Your post has been scheduled for ${selectedDate?.toLocaleDateString()}`
        : "Your draft has been saved",
    });
    
    // Reset form
    setNewPost({
      content: "",
      platforms: [],
      mediaIncluded: false,
      status: "draft",
    });
    setSelectedDate(undefined);
    setIsScheduling(false);
  };
  
  const generateAIContent = () => {
    // In a real app, this would call an AI service to generate content
    setTimeout(() => {
      setNewPost(prev => ({
        ...prev,
        content: "Excited to share my latest insights on how AI is transforming social media marketing! Check out my new blog post. #AIMarketing #SocialMediaTips",
      }));
      
      toast({
        title: "AI Content Generated",
        description: "A new post has been generated based on your profile and audience.",
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Post Automation</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create, schedule, and automate your social media posts
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="create">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Post</CardTitle>
              <CardDescription>
                Create and schedule a new post across your social platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Post Content</Label>
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={generateAIContent}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea 
                  placeholder="What would you like to share?" 
                  className="min-h-[120px]"
                  value={newPost.content}
                  onChange={handleContentChange}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{newPost.content?.length || 0} characters</span>
                  <span>Recommended: 80-100 characters</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {["instagram", "linkedin", "twitter", "facebook"].map((platform) => {
                    const isSelected = (newPost.platforms || []).includes(platform as Platform);
                    const Icon = platformIcons[platform as Platform];
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "gap-1",
                          isSelected ? "bg-primary" : "hover:bg-primary/10"
                        )}
                        onClick={() => togglePlatform(platform as Platform)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{platform}</span>
                        {isSelected && <Check className="h-3 w-3 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Media</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-32 flex flex-col">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span>Add Image or Video</span>
                    <span className="text-xs text-gray-500 mt-1">Supports JPG, PNG, MP4</span>
                  </Button>
                  
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center h-32">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="use-ai-avatar"
                        checked={newPost.mediaIncluded}
                        onCheckedChange={(checked) => 
                          setNewPost(prev => ({ ...prev, mediaIncluded: checked === true }))
                        }
                      />
                      <Label htmlFor="use-ai-avatar" className="ml-2">Use AI Avatar</Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your AI avatar will create a video based on your post content
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setIsScheduling(true)}>
                    <CalendarIcon2 className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Post</DialogTitle>
                    <DialogDescription>
                      Choose when you want this post to be published
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="mx-auto"
                    />
                    
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-repost" />
                      <Label htmlFor="auto-repost">Auto-repost weekly</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={savePost}>Schedule Post</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => { setIsScheduling(false); savePost(); }}>
                Save as Draft
              </Button>
              
              <Button onClick={() => { setIsScheduling(false); savePost(); }}>
                Post Now
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduled Posts ({posts.filter(p => p.status === "scheduled").length})</h3>
            
            {posts.filter(p => p.status === "scheduled").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts
                  .filter(p => p.status === "scheduled")
                  .map(post => (
                    <Card key={post.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex space-x-1">
                            {post.platforms.map(platform => {
                              const Icon = platformIcons[platform];
                              return <Icon key={platform} className="h-4 w-4" />;
                            })}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {post.scheduledDate?.toLocaleDateString()}
                            <Clock className="h-3 w-3 mx-1" />
                            10:00 AM
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{post.content}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-500">Cancel</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">No scheduled posts yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Create new posts to schedule them for future publishing
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="drafts">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Drafts ({posts.filter(p => p.status === "draft").length})</h3>
            
            {posts.filter(p => p.status === "draft").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts
                  .filter(p => p.status === "draft")
                  .map(post => (
                    <Card key={post.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex space-x-1">
                            {post.platforms.map(platform => {
                              const Icon = platformIcons[platform];
                              return <Icon key={platform} className="h-4 w-4" />;
                            })}
                          </div>
                          <div className="text-xs text-gray-500">Draft</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{post.content}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Schedule</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">No drafts available</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Save posts as drafts to work on them later
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostAutomation;
