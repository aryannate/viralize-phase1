
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, Save, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const HashtagGenerator = () => {
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateHashtags = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content to generate hashtags",
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
          type: 'hashtags',
          prompt: content,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setHashtags(Array.isArray(data.result) ? data.result : []);
      
      toast({
        title: "Hashtags generated",
        description: "Your hashtags have been generated successfully!",
      });
    } catch (error: any) {
      console.error("Error generating hashtags:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate hashtags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const hashtagsText = hashtags.map(tag => `#${tag}`).join(' ');
    navigator.clipboard.writeText(hashtagsText);
    toast({
      title: "Copied to clipboard",
      description: "Hashtags copied to clipboard",
    });
  };

  const saveHashtags = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save hashtags",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('ai_responses').insert({
        user_id: user.id,
        response_type: 'hashtags',
        content: hashtags.join(','),
        metadata: { original_content: content }
      });

      if (error) throw error;

      toast({
        title: "Hashtags saved",
        description: "Your hashtags have been saved to your account",
      });
    } catch (error: any) {
      console.error("Error saving hashtags:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save hashtags. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Hashtag Generator</CardTitle>
          <CardDescription>
            Generate trending and relevant hashtags for your content to increase discoverability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your content or paste your post here..."
              className="min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button 
            onClick={generateHashtags} 
            disabled={isLoading || !content.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Hashtags</>
            )}
          </Button>
        </CardContent>
      </Card>

      {hashtags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Hashtags</CardTitle>
            <CardDescription>
              Use these hashtags to increase your content's reach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {hashtags.map((tag, index) => (
                <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center">
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" /> Copy All
            </Button>
            <Button onClick={saveHashtags}>
              <Save className="mr-2 h-4 w-4" /> Save Hashtags
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default HashtagGenerator;
