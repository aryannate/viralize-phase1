
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Video, Mic, Instagram, Linkedin, Calendar, Zap, Hash, MessageSquare, DollarSign, Handshake, RefreshCw } from "lucide-react";

const features = [
  {
    title: "AI Avatar Creation",
    description: "Upload videos to train your custom AI avatar with personalized expressions and movements.",
    icon: <Video className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Voice Refinement",
    description: "Fine-tune AI voice models to sound exactly like you for authentic content creation.",
    icon: <Mic className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Social Integration",
    description: "Connect your Instagram, LinkedIn, and other social accounts for seamless posting.",
    icon: <Instagram className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Post Automation",
    description: "Schedule and automate content delivery across all your connected platforms.",
    icon: <Calendar className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Hashtag & Caption Generator",
    description: "Create engaging captions and find trending hashtags with AI to boost your content's reach.",
    icon: <Hash className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Content Repurposing",
    description: "Transform long-form content into multiple short posts optimized for different platforms.",
    icon: <RefreshCw className="h-10 w-10 text-purple-500" />
  },
  {
    title: "AI Comment Responder",
    description: "Automate audience engagement with personalized AI replies to comments and DMs.",
    icon: <MessageSquare className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Monetization Insights",
    description: "Discover revenue opportunities and brand partnerships based on your audience data.",
    icon: <DollarSign className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Collaboration Hub",
    description: "Connect directly with brands for sponsorships and partnership opportunities.",
    icon: <Handshake className="h-10 w-10 text-purple-500" />
  },
  {
    title: "Performance Analytics",
    description: "Track engagement metrics and growth across all your social media platforms.",
    icon: <Zap className="h-10 w-10 text-purple-500" />
  },
];

const FeatureSection = () => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-4">Powerful Features</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-3xl mx-auto">
        Everything you need to automate your social media presence with AI
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
