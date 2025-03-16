
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, DollarSign, ArrowRight, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type MonetizationInsight = {
  title: string;
  description: string;
  estimatedValue: string | null;
};

const MonetizationInsights = () => {
  const [profile, setProfile] = useState("");
  const [insights, setInsights] = useState<MonetizationInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateInsights = async () => {
    if (!profile.trim()) {
      toast({
        title: "Profile information required",
        description: "Please enter your profile and audience information",
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
          type: 'monetization',
          prompt: profile,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Handle the result based on format
      if (Array.isArray(data.result)) {
        setInsights(data.result);
      } else if (typeof data.result === 'string') {
        // Try to parse JSON from string if possible
        try {
          const parsedInsights = JSON.parse(data.result);
          setInsights(Array.isArray(parsedInsights) ? parsedInsights : []);
        } catch (e) {
          // If parsing fails, create a single insight from the text
          setInsights([{
            title: "Monetization Opportunity",
            description: data.result,
            estimatedValue: null
          }]);
        }
      }
      
      toast({
        title: "Insights generated",
        description: "Your monetization insights have been generated!",
      });
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveInsight = async (insight: MonetizationInsight) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save insights",
        variant: "destructive",
      });
      return;
    }

    try {
      // First save to AI responses for history
      await supabase.from('ai_responses').insert({
        user_id: user.id,
        response_type: 'monetization_insight',
        content: insight.description,
        metadata: { 
          title: insight.title, 
          estimated_value: insight.estimatedValue,
          original_profile: profile
        }
      });
      
      // Then save to monetization insights table
      const numValue = insight.estimatedValue 
        ? parseFloat(insight.estimatedValue.replace(/[^0-9.-]+/g, "")) 
        : null;
        
      await supabase.from('monetization_insights').insert({
        user_id: user.id,
        insight_type: 'opportunity',
        title: insight.title,
        description: insight.description,
        estimated_value: numValue,
      });

      toast({
        title: "Insight saved",
        description: "This monetization insight has been saved to your account",
      });
    } catch (error: any) {
      console.error("Error saving insight:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save insight. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monetization Insights</CardTitle>
          <CardDescription>
            Discover revenue opportunities based on your audience and niche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your audience demographics, niche, engagement metrics, and any previous brand collaborations..."
              className="min-h-[120px]"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
          </div>
          <Button 
            onClick={generateInsights} 
            disabled={isLoading || !profile.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Generate Monetization Insights</>
            )}
          </Button>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-xl font-bold">Revenue Opportunities</h3>
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    {insight.title}
                  </CardTitle>
                  {insight.estimatedValue && (
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      Est. Value: {insight.estimatedValue}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{insight.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => saveInsight(insight)}>
                  <Save className="mr-2 h-4 w-4" /> Save Insight
                </Button>
                <Button variant="ghost" className="text-primary">
                  Explore <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonetizationInsights;
