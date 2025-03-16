
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, Save, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CommentResponder = () => {
  const [comment, setComment] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateResponse = async () => {
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment to generate a response",
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
          type: 'comments',
          prompt: comment,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResponse(data.result);
      
      toast({
        title: "Response generated",
        description: "Your comment response has been generated!",
      });
    } catch (error: any) {
      console.error("Error generating response:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    toast({
      title: "Copied to clipboard",
      description: "Response copied to clipboard",
    });
  };

  const saveResponse = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save response",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase.from('ai_responses').insert({
        user_id: user.id,
        response_type: 'comment_response',
        content: response,
        metadata: { original_comment: comment }
      });

      toast({
        title: "Response saved",
        description: "Your response has been saved to your account",
      });
    } catch (error: any) {
      console.error("Error saving response:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save response. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Comment & DM Responder</CardTitle>
          <CardDescription>
            Generate personalized responses to comments and direct messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste the comment or message you received here..."
              className="min-h-[120px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <Button 
            onClick={generateResponse} 
            disabled={isLoading || !comment.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Response</>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Response</CardTitle>
            <CardDescription>
              Your personalized response to the comment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/30 p-4 rounded-lg whitespace-pre-wrap">
              {response}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button onClick={saveResponse}>
              <Save className="mr-2 h-4 w-4" /> Save Response
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CommentResponder;
