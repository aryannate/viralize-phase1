
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CaptionGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captionLength, setCaptionLength] = useState("medium");
  const { user } = useAuth();
  const { toast } = useToast();

  const generateCaption = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate a caption",
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
          type: 'caption',
          prompt,
          contentLength: captionLength,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCaption(data.result);
      
      toast({
        title: "Caption generated",
        description: "Your caption has been generated successfully!",
      });
    } catch (error: any) {
      console.error("Error generating caption:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate caption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(caption);
    toast({
      title: "Copied to clipboard",
      description: "Caption copied to clipboard",
    });
  };

  const saveCaption = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save captions",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to AI responses for history
      await supabase.from('ai_responses').insert({
        user_id: user.id,
        response_type: 'caption',
        content: caption,
        metadata: { original_prompt: prompt }
      });
      
      // Save to captions table
      await supabase.from('captions').insert({
        user_id: user.id,
        content: caption,
        theme: prompt
      });

      toast({
        title: "Caption saved",
        description: "Your caption has been saved to your account",
      });
    } catch (error: any) {
      console.error("Error saving caption:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save caption. Please try again.",
        variant: "destructive",
      });
    }
  };

  const regenerateCaption = () => {
    generateCaption();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Caption Generator</CardTitle>
          <CardDescription>
            Create engaging captions for your social media posts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <Textarea
                  placeholder="Describe your post or what you want to express..."
                  className="min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="w-1/4">
                <label className="text-sm font-medium mb-2 block">Caption Length</label>
                <Select value={captionLength} onValueChange={setCaptionLength}>
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
          </div>
          <Button 
            onClick={generateCaption} 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Caption</>
            )}
          </Button>
        </CardContent>
      </Card>

      {caption && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Caption</CardTitle>
            <CardDescription>
              Use this caption for your social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/30 p-4 rounded-lg whitespace-pre-wrap">
              {caption}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" onClick={regenerateCaption}>
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </div>
            <Button onClick={saveCaption}>
              <Save className="mr-2 h-4 w-4" /> Save Caption
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CaptionGenerator;
