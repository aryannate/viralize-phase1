import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, platform, contentLength } = await req.json();

    let systemPrompt = "You are a helpful assistant for social media content creation.";
    let userPrompt = prompt;

    // Customize the system prompt based on the type of content
    switch (type) {
      case 'hashtags':
        systemPrompt = "You are a social media hashtag expert. Generate relevant, trending hashtags for the given content. Format as a JSON array of strings.";
        userPrompt = `Generate 10 engaging and relevant hashtags for this content: "${prompt}". Return only a JSON array of hashtag strings without the # symbol.`;
        break;
      case 'caption':
        systemPrompt = "You are a social media caption expert. Create engaging, authentic captions for social media posts.";
        userPrompt = `Write an engaging ${contentLength || 'medium-length'} caption for this post: "${prompt}". Make it sound authentic and personal.`;
        break;
      case 'repurpose':
        systemPrompt = "You are a content repurposing expert. Transform content to fit different platforms while maintaining the message.";
        userPrompt = `Repurpose this content: "${prompt}" for ${platform || 'Instagram'} in a ${contentLength || 'concise'} format. Optimize for the platform's style and audience.`;
        break;
      case 'comments':
        systemPrompt = "You are a community manager responding to social media comments. Be friendly, authentic, and engaging.";
        userPrompt = `Generate a personalized response to this comment: "${prompt}". Sound authentic and conversational.`;
        break;
      case 'monetization':
        systemPrompt = "You are a monetization expert for social media influencers. Provide practical revenue opportunities based on engagement data.";
        userPrompt = `Based on this influencer profile and engagement data: "${prompt}", suggest 3 revenue opportunities or brand partnerships that would be a good fit. Format as JSON with 'title', 'description', and 'estimatedValue' fields.`;
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let result = data.choices[0].message.content;

    // For hashtags, ensure we return a properly formatted array
    if (type === 'hashtags') {
      try {
        // If the result is already a valid JSON array, use it
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          result = parsed;
        } else {
          // Otherwise extract hashtags and format as array
          result = result.replace(/["'[\]{}]/g, '')
            .split(/,|\n/)
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        }
      } catch (e) {
        // If parsing fails, extract hashtags from text
        result = result.replace(/["'[\]{}]/g, '')
          .split(/,|\n/)
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
    }

    // For monetization insights, ensure we return properly formatted JSON
    if (type === 'monetization') {
      try {
        JSON.parse(result);
      } catch (e) {
        // If not valid JSON, try to extract and format it
        const insights = result.split(/\d+\./).filter(Boolean).map((insight, index) => {
          const lines = insight.trim().split('\n');
          const title = lines[0].replace(/^[^a-zA-Z]+/, '').trim();
          const description = lines.slice(1).join(' ').trim();
          return {
            title,
            description,
            estimatedValue: null
          };
        });
        result = insights;
      }
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-content-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
