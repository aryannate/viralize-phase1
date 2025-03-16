
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ContentRepurposer = () => {
  const [originalContent, setOriginalContent] = useState("");
  const [repurposedContent, setRepurposedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState("instagram");
  const [contentLength, setContentLength] = useState("medium");
  const { user } = useAuth();
  const { toast } = useToast();

  const repurposeContent = async () => {
    if (!originalContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content to repurpose",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/ai-content-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'repurpose',
          prompt: originalContent,
          platform,
          contentLength,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setRepurposedContent(data.result);
      
      toast({
        title: "Content repurposed",
        description: `Your content has been repurposed for ${platform}!`,
      });
    } catch (error: any) {
      console.error("Error repurposing content:", error);
      toast({
        title: "Repurposing failed",
        description: error.message || "Failed to repurpose content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast({
      title: "Copied to clipboard",
      description: "Repurposed content copied to clipboard",
    });
  };

  const saveContent = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save repurposed content",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase.from('ai_responses').insert({
        user_id: user.id,
        response_type: 'repurposed_content',
        content: repurposedContent,
        metadata: { 
          original_content: originalContent,
          platform,
          content_length: contentLength
        }
      });

      toast({
        title: "Content saved",
        description: "Your repurposed content has been saved to your account",
      });
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Repurposer</CardTitle>
          <CardDescription>
            Transform your existing content for different platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your original content here..."
              className="min-h-[120px]"
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="pinterest">Pinterest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Content Length</label>
              <Select value={contentLength} onValueChange={setContentLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={repurposeContent} 
            disabled={isLoading || !originalContent.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Repurposing...
              </>
            ) : (
              <>Repurpose Content</>
            )}
          </Button>
        </CardContent>
      </Card>

      {repurposedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Repurposed Content</CardTitle>
            <CardDescription>
              Your content optimized for {platform}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/30 p-4 rounded-lg whitespace-pre-wrap">
              {repurposedContent}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" onClick={repurposeContent}>
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </div>
            <Button onClick={saveContent}>
              <Save className="mr-2 h-4 w-4" /> Save Content
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ContentRepurposer;
