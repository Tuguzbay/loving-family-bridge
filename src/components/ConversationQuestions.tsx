
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { shortAnswerQuestions, longAnswerQuestions, shortAnswerOptions, type ConversationQuestion } from '@/data/conversationQuestions';

interface ConversationQuestionsProps {
  onComplete: (answers: Record<number, string>) => void;
}

export const ConversationQuestions = ({ onComplete }: ConversationQuestionsProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const allQuestions = [...shortAnswerQuestions, ...longAnswerQuestions];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNext = async () => {
    if (isLastQuestion) {
      if (isSubmitting) return; // Prevent double submission
      setIsSubmitting(true);
      try {
        await onComplete(answers);
      } catch (error) {
        console.error('Error completing conversation:', error);
        setIsSubmitting(false); // Reset on error to allow retry
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const canProceed = answers[currentQuestion.id] && answers[currentQuestion.id].trim() !== '';
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQuestion.type === 'short' ? 'Rate Your Agreement' : 'Share Your Thoughts'}
          </CardTitle>
          <CardDescription>
            {currentQuestion.type === 'short' 
              ? 'How much do you agree with this statement?'
              : 'Take your time to reflect and share openly.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-800 font-medium">
              {currentQuestion.question}
            </p>
          </div>
          
          {currentQuestion.type === 'short' ? (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              className="space-y-4"
            >
              {shortAnswerOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="long-answer" className="text-sm font-medium text-gray-700">
                Your response:
              </Label>
              <Textarea
                id="long-answer"
                placeholder="Share your thoughts here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="min-h-32 resize-none"
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500">
                {(answers[currentQuestion.id] || '').length}/1000 characters
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isLastQuestion ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
