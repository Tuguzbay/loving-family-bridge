
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceToken = Deno.env.get('HUGGING_FACE_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { parentResponses, childResponses } = await req.json();

    const prompt = `You are an emotionally intelligent AI that helps parents and children understand each other more deeply.

You are given:
- 10 short (agree/disagree) responses and
- 3 long open-ended responses

...from both a child and a parent, about their relationship.

Your job is to:
1. Analyze the emotional patterns from both sides (trust, conflict, misunderstanding, distance, willingness, fear, etc.)
2. Identify emotional mismatches, shared desires, or blind spots
3. Write:
    - A short emotional profile summary for each person
    - 1 tailored reflective question for each person
    - 1 personalized emotional conclusion for each person

Do not reveal the other's exact words. Speak gently, neutrally, and with empathy.

Child short answers:
${childResponses.short.map((answer: string, index: number) => `${index + 1}. ${answer}`).join('\n')}

Child long answers:
${childResponses.long.map((answer: string, index: number) => `${index + 1}. ${answer}`).join('\n')}

Parent short answers:
${parentResponses.short.map((answer: string, index: number) => `${index + 1}. ${answer}`).join('\n')}

Parent long answers:
${parentResponses.long.map((answer: string, index: number) => `${index + 1}. ${answer}`).join('\n')}

Expected Output Format (JSON):

{
  "childProfile": "A few sentences summarizing the child's emotional state, fears, and hopes.",
  "parentProfile": "A few sentences summarizing the parent's emotional state, confusion, and intentions.",
  "childQuestion": "Your tailored question for the child here",
  "parentQuestion": "Your tailored question for the parent here",
  "childConclusion": "Encouraging, emotionally intelligent message for the child",
  "parentConclusion": "Encouraging, emotionally intelligent message for the parent"
}`;

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle Hugging Face response format
    let generatedText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      throw new Error('Unexpected response format from Hugging Face');
    }

    // Try to parse as JSON, fallback to text if needed
    try {
      const jsonStart = generatedText.indexOf('{');
      const jsonEnd = generatedText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = generatedText.slice(jsonStart, jsonEnd);
        const parsedAnalysis = JSON.parse(jsonString);
        
        return new Response(JSON.stringify(parsedAnalysis), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON, returning raw text');
    }
    
    // Fallback to text format
    return new Response(JSON.stringify({ analysis: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-parent-child-relationship function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: "We're having trouble generating insights right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
