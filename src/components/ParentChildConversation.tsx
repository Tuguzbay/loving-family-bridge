
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParentChildAssessment } from '@/hooks/useParentChildAssessment';
import type { Profile } from '@/types/profile';

// Parent-specific questions about their relationship with their child
const parentQuestions = [
  // Short answer questions (agree/disagree/neutral)
  { id: 1, text: "I feel my child trusts me with their problems.", type: "short" },
  { id: 2, text: "My child and I communicate openly about important topics.", type: "short" },
  { id: 3, text: "I understand what motivates my child.", type: "short" },
  { id: 4, text: "My child seems comfortable sharing their feelings with me.", type: "short" },
  { id: 5, text: "We rarely have arguments or conflicts.", type: "short" },
  { id: 6, text: "I feel confident in my parenting approach with this child.", type: "short" },
  { id: 7, text: "My child respects the boundaries I set.", type: "short" },
  { id: 8, text: "I know what's going on in my child's life.", type: "short" },
  { id: 9, text: "My child comes to me when they need help.", type: "short" },
  { id: 10, text: "I feel emotionally connected to my child.", type: "short" },
  
  // Long answer questions
  { 
    id: 11, 
    text: "What do you wish your child understood about you as a parent?", 
    type: "long",
    placeholder: "Share what you'd want them to know about your intentions, feelings, or experiences as their parent..."
  },
  { 
    id: 12, 
    text: "What makes conversations with your child difficult, and how would you like them to improve?", 
    type: "long",
    placeholder: "Think about the barriers to communication and what would help you connect better..."
  },
  { 
    id: 13, 
    text: "Describe your hopes for your relationship with this child.", 
    type: "long",
    placeholder: "Share your dreams and goals for how you want your relationship to grow..."
  }
];

interface ParentChildConversationProps {
  child: Profile;
  familyId: string;
  onComplete: () => void;
  onBack: () => void;
}

export const ParentChildConversation = ({ child, familyId, onComplete, onBack }: ParentChildConversationProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { saveParentResponses, loading } = useParentChildAssessment();

  const progress = (Object.keys(responses).length / parentQuestions.length) * 100;
  const currentQ = parentQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === parentQuestions.length - 1;
  const canProceed = responses[currentQ.id] && responses[currentQ.id].trim() !== '';

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < parentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Separate short and long responses
      const shortResponses: string[] = [];
      const longResponses: string[] = [];
      
      parentQuestions.forEach(question => {
        const response = responses[question.id];
        if (question.type === 'short') {
          shortResponses.push(response);
        } else {
          longResponses.push(response);
        }
      });

      const result = await saveParentResponses(familyId, child.id, {
        short: shortResponses,
        long: longResponses
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Assessment Complete!",
          description: `Your responses about ${child.full_name} have been saved.`
        });
        onComplete();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">
                Assessment for {child.full_name}
              </h1>
            </div>
            <p className="text-gray-600">
              Share your perspective on your relationship with {child.full_name}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {parentQuestions.length}
              </span>
              <Badge variant="outline">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              {currentQ.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.type === "short" ? (
              <div className="space-y-3">
                {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((option) => (
                  <Button
                    key={option}
                    variant={responses[currentQ.id] === option ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleResponseChange(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <Textarea
                placeholder={currentQ.placeholder}
                value={responses[currentQ.id] || ""}
                onChange={(e) => handleResponseChange(e.target.value)}
                className="min-h-[120px]"
              />
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Submitting..." : "Complete Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
