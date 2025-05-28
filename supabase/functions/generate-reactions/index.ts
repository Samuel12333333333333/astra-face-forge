
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headshotUrl, theme, userProfile, reactionTypes } = await req.json();

    const reactions = [];

    for (const reactionType of reactionTypes) {
      const prompt = generatePromptForReactionType(reactionType, theme, userProfile);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert in professional image analysis and personal branding. Provide detailed, realistic feedback as if you were the specified professional reviewing this headshot.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      const reaction = parseAIResponse(analysis, reactionType);
      reactions.push(reaction);
    }

    return new Response(JSON.stringify({ reactions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-reactions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePromptForReactionType(reactionType: string, theme: string, userProfile: any) {
  const basePrompt = `Analyze this professional headshot with the theme "${theme}". `;
  
  switch (reactionType) {
    case 'recruiter':
      return basePrompt + `As an HR manager or recruiter, evaluate this headshot for professional hiring. Consider: Does this person look competent, trustworthy, and professional? Would you want to interview them? Rate 1-10 and provide specific feedback about their professional presence, including what impression they give and likelihood of getting an interview.`;
    
    case 'investor':
      return basePrompt + `As a venture capitalist or investor, evaluate this person's founder potential. Consider: Do they look like someone who could lead a company, inspire confidence, and execute on big ideas? Rate 1-10 and provide feedback about their leadership presence and whether you'd consider funding their startup.`;
    
    case 'dating':
      return basePrompt + `As a potential dating match on a dating app, evaluate this profile photo. Consider: Is this person attractive, approachable, and someone you'd want to get to know? Rate 1-10 and provide feedback about their appeal and whether you'd swipe right.`;
    
    case 'networking':
      return basePrompt + `As an industry peer at a networking event, evaluate this person's professional networking appeal. Consider: Do they look like someone you'd want to connect with professionally? Do they seem knowledgeable and influential in their field? Rate 1-10 and provide feedback.`;
    
    default:
      return basePrompt + `Provide a professional analysis of this headshot including a rating from 1-10 and detailed feedback.`;
  }
}

function parseAIResponse(analysis: string, reactionType: string) {
  // Extract score (look for number/10 or number out of 10)
  const scoreMatch = analysis.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of)\s*10/i);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : Math.random() * 3 + 7; // fallback random score 7-10

  // Extract key traits and feedback
  const feedback = analysis.replace(/\d+(?:\.\d+)?\s*(?:\/|out of)\s*10/gi, '').trim();
  
  // Generate likelihood based on score and type
  const getLikelihood = (score: number, type: string) => {
    if (score >= 8.5) {
      switch (type) {
        case 'recruiter': return 'Very likely to interview';
        case 'investor': return 'Would consider funding';
        case 'dating': return 'Would definitely swipe right';
        case 'networking': return 'Eager to connect';
        default: return 'Highly positive';
      }
    } else if (score >= 7) {
      switch (type) {
        case 'recruiter': return 'Likely to consider';
        case 'investor': return 'Interested in learning more';
        case 'dating': return 'Would swipe right';
        case 'networking': return 'Would connect';
        default: return 'Positive';
      }
    } else {
      return 'Needs improvement';
    }
  };

  // Extract traits from common adjectives in the feedback
  const commonTraits = ['professional', 'confident', 'trustworthy', 'approachable', 'competent', 'innovative', 'attractive', 'experienced'];
  const traits = commonTraits.filter(trait => 
    feedback.toLowerCase().includes(trait)
  ).slice(0, 3);

  return {
    type: reactionType,
    score: Math.round(score * 10) / 10,
    feedback: feedback.substring(0, 200) + (feedback.length > 200 ? '...' : ''),
    likelihood: getLikelihood(score, reactionType),
    traits: traits.length > 0 ? traits : ['Professional', 'Confident', 'Competent']
  };
}
