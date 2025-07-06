
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AssessmentResponses {
  short: string[];
  long: string[];
}

interface AnalysisResult {
  childProfile: string;
  parentProfile: string;
  childQuestion: string;
  parentQuestion: string;
  childConclusion: string;
  parentConclusion: string;
}

const huggingFaceToken = Deno.env.get('HUGGING_FACE_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validateInput = (data: any): { parentResponses: AssessmentResponses, childResponses: AssessmentResponses } => {
  if (!data.parentResponses || !data.childResponses) {
    throw new Error('Missing required responses');
  }

  const validateResponses = (responses: any): AssessmentResponses => {
    if (!responses.short || !responses.long) {
      throw new Error('Invalid responses structure');
    }
    return {
      short: Array.isArray(responses.short) ? responses.short : [],
      long: Array.isArray(responses.long) ? responses.long : []
    };
  };

  return {
    parentResponses: validateResponses(data.parentResponses),
    childResponses: validateResponses(data.childResponses)
  };
};

const extractJSON = (text: string): AnalysisResult | null => {
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd <= jsonStart) return null;
    
    const jsonString = text.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);
    
    // Validate the parsed structure
    if (parsed.childProfile && parsed.parentProfile) {
      return parsed as AnalysisResult;
    }
    return null;
  } catch {
    return null;
  }
};

function parseTextResponse(text: string): Partial<AnalysisResult> {
  const result: Partial<AnalysisResult> = {};
  const patterns = {
    childProfile: /child profile[:\-]?\s*(.*?)(?=\nparent profile|$)/is,
    parentProfile: /parent profile[:\-]?\s*(.*?)(?=\nchild question|$)/is,
    childQuestion: /child question[:\-]?\s*(.*?)(?=\nparent question|$)/is,
    parentQuestion: /parent question[:\-]?\s*(.*?)(?=\nchild conclusion|$)/is,
    childConclusion: /child conclusion[:\-]?\s*(.*?)(?=\nparent conclusion|$)/is,
    parentConclusion: /parent conclusion[:\-]?\s*(.*)/is
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result[key as keyof AnalysisResult] = match[1].trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\*+/g, '');
    }
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { parentResponses, childResponses } = validateInput(requestData);

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
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Hugging Face response:', data);
    
    const generatedText = Array.isArray(data) 
      ? data[0]?.generated_text || ''
      : data.generated_text || '';

    console.log('Generated HuggingFace output:', generatedText);

    // Try to extract structured JSON first
    const structuredResult = extractJSON(generatedText);
    if (structuredResult) {
      console.log('Successfully extracted structured JSON:', structuredResult);
      return new Response(JSON.stringify(structuredResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback to parsed sections if JSON extraction fails
    console.log('Falling back to text parsing');
    const sections = parseTextResponse(generatedText);
    return new Response(JSON.stringify(sections), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-parent-child-relationship function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: "Analysis service is currently unavailable. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
