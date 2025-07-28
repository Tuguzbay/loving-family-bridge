
// Uses OpenRouter.ai API for AI analysis
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

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

if (!openRouterApiKey) {
  console.error('OPENROUTER_API_KEY is not set');
}

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
        .replace(/^['"]|['"]$/g, '')
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

    // Build the prompt for deepseek model
    const systemPrompt = `You are an emotionally intelligent AI family relationship expert with decades of experience working with real families. Your responses should feel like they come from someone who has sat in countless living rooms, heard thousands of family conversations, and witnessed the beautiful mess of human relationships.

When analyzing responses, think like a therapist who knows that behind every answer is a real person with hopes, fears, and stories. Use the actual words and phrases from their responses to create insights that feel personal and specific.

Your analysis should include:
- Direct quotes or references to specific things they said
- Concrete moments or scenarios they can relate to  
- Real, human language that sounds like caring advice from a wise friend
- Specific behavioral observations based on their actual words
- Practical suggestions tied to their unique situation

Provide a structured JSON response with exactly these fields:

{
  "childProfile": "A deeply personal analysis that references their actual words and reveals insights about their emotional world, communication style, and needs. Include specific phrases they used and what they reveal about this unique child.",
  "parentProfile": "A compassionate analysis that honors their perspective while referencing their actual responses. Show understanding of their specific challenges and approaches, using their own language when possible.", 
  "childQuestion": "A meaningful, specific question the child could ask their parent - one that feels natural for THIS child based on their responses and would open real dialogue",
  "parentQuestion": "A thoughtful question the parent could ask THIS specific child - one that shows they've been listening and want to understand their child's unique perspective",
  "childConclusion": "Specific, actionable advice that speaks directly to this child's situation, using examples from their responses and offering concrete next steps they can actually take",
  "parentConclusion": "Practical, empathetic guidance for this parent's specific situation, referencing their actual concerns and offering realistic strategies that honor both parent and child"
}

Return only valid JSON. Make every insight feel like it comes from someone who truly knows this family.`;

    const userPrompt = `Child Assessment Responses:\nShort answers: ${childResponses.short.join(', ')}\nLong answers: ${childResponses.long.join(' | ')}\n\nParent Assessment Responses:\nShort answers: ${parentResponses.short.join(', ')}\nLong answers: ${parentResponses.long.join(' | ')}`;

    console.log('Sending request to OpenRouter API...');
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }
    
    // Add timeout handling for the OpenRouter API call
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.log('API request timeout after 30 seconds');
      controller.abort();
    }, 30000); // 30 second timeout

    let response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-app.com', // Optional: for analytics
          'X-Title': 'Family Assessment App', // Optional: for analytics
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        console.error('OpenRouter API request timed out');
        throw new Error('AI analysis timed out. Please try again.');
      }
      console.error('OpenRouter API network error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
      console.log('Raw OpenRouter response:', data);
    } catch (jsonError) {
      console.error('Failed to parse OpenRouter response as JSON:', jsonError);
      throw new Error('Invalid response format from AI service');
    }
    
    // Extract content from OpenAI-compatible response format
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    if (!generatedText) {
      console.error('No content in AI response:', data);
      throw new Error('AI service returned empty response');
    }

    console.log('Generated OpenRouter output:', generatedText);

    // Try to extract structured JSON first with improved error handling
    let structuredResult;
    try {
      structuredResult = extractJSON(generatedText);
    } catch (extractError) {
      console.error('JSON extraction failed:', extractError);
      structuredResult = null;
    }
    
    if (structuredResult) {
      console.log('Successfully extracted structured JSON:', structuredResult);
      return new Response(JSON.stringify(structuredResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try cleaning the text before fallback parsing
    console.log('Attempting text cleaning before fallback parsing');
    const cleanedText = generatedText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    try {
      const cleanedResult = extractJSON(cleanedText);
      if (cleanedResult) {
        console.log('Successfully extracted JSON after cleaning:', cleanedResult);
        return new Response(JSON.stringify(cleanedResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (cleanError) {
      console.log('Cleaned text also failed JSON parsing:', cleanError);
    }

    // Fallback to parsed sections if JSON extraction fails
    console.log('Falling back to text parsing');
    const sections = parseTextResponse(generatedText);
    const hasAnySection = Object.keys(sections).length > 0 && Object.values(sections).some(Boolean);
    if (hasAnySection) {
      console.log('Returning partial analysis result:', sections);
      return new Response(JSON.stringify({ ...sections, _warning: 'Partial result: model did not return full JSON.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If everything fails, return a clear error with the raw output
    console.error('Model output could not be parsed. Raw output:', generatedText);
    return new Response(JSON.stringify({
      error: 'Model output could not be parsed. The AI model may have returned malformed data.',
      raw_output: generatedText.substring(0, 500) + '...' // Truncate for safety
    }), {
      status: 500,
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
