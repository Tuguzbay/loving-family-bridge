
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

    console.log('Sending request to Hugging Face API...');
    
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
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Hugging Face response:', data);
    
    // Handle Hugging Face response format
    let generatedText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      console.error('Unexpected response format from Hugging Face:', data);
      throw new Error('Unexpected response format from Hugging Face');
    }

    console.log('Generated HuggingFace output:', generatedText);

    // Try to parse as JSON using safer regex approach
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON:', parsed);
        
        // Validate that we have the expected structure
        if (parsed.childProfile && parsed.parentProfile) {
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.warn('JSON parsed but missing required fields:', parsed);
        }
      }
    } catch (parseError) {
      console.warn('Could not parse Hugging Face response as JSON:', parseError);
    }
    
    // Fallback to text format
    console.log('Falling back to raw text format');
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
