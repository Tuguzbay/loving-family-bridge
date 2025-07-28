
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/contexts/FamilyContext";
import { useProfileData } from "@/hooks/useProfileData";
import { ConversationQuestions } from "@/components/ConversationQuestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

const Conversation = () => {
  const { user } = useAuth();
  const { family, conversationCompletion, loading } = useFamily();
  const { profile } = useProfileData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Fetch profile data when user is available
  useEffect(() => {
    if (user && !profile) {
      // Profile will be fetched by useProfileData hook
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleStartConversation = () => {
    if (conversationCompletion) {
      toast({
        title: "Assessment Already Completed",
        description: "You have already completed the family assessment.",
        variant: "destructive"
      });
      return;
    }
    setConversationStarted(true);
  };

  const handleConversationComplete = async (answers: Record<number, string>) => {
    if (!user || !family) {
      toast({
        title: "Error",
        description: "User or family information missing.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Saving conversation responses:', answers);
    
    try {
      // Save all responses
      const responses = Object.entries(answers).map(([questionId, response]) => ({
        user_id: user.id,
        family_id: family.id,
        question_id: parseInt(questionId),
        question_type: parseInt(questionId) <= 10 ? 'short' : 'long',
        response: response
      }));

      const { error: responsesError } = await supabase
        .from('conversation_responses')
        .insert(responses);

      if (responsesError) {
        console.error('Error saving responses:', responsesError);
        throw responsesError;
      }

      // Mark conversation as completed
      const { error: completionError } = await supabase
        .from('conversation_completions')
        .insert({
          user_id: user.id,
          family_id: family.id,
          total_questions: Object.keys(answers).length
        });

      if (completionError) {
        console.error('Error marking completion:', completionError);
        throw completionError;
      }

      console.log('Conversation completed and saved successfully');
      
      toast({
        title: "Assessment Complete!",
        description: "Thank you for sharing your thoughts. Your responses help us understand your family better.",
      });

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: "Error Saving Response",
        description: "There was an error saving your responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          variants={fadeUp}
          className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8"
        >
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">Family Required</CardTitle>
            <CardDescription className="text-center text-gray-700">
              You need to be part of a family to start conversations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold shadow-lg rounded-full px-8 py-3 text-lg">
              Return to Dashboard
            </Button>
          </CardContent>
        </motion.div>
      </div>
    );
  }

  const isChild = profile?.user_type === 'child';

  // If conversation is already completed, show completion screen
  if (conversationCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation */}
        <motion.nav
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          variants={fadeUp}
          className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-md z-10 relative"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FamilyConnect</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              {profile?.full_name.split(' ')[0]}
            </span>
          </div>
        </motion.nav>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
              variants={fadeUp}
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-2xl rounded-3xl text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900 font-bold">
                    {isChild ? "Assessment Already Complete! 🎉" : "Assessment Already Complete!"}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700">
                    You completed this assessment on {new Date(conversationCompletion.completed_at).toLocaleDateString()}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`p-6 rounded-lg ${isChild ? 'bg-purple-50' : 'bg-blue-50'}`}>
                    <p className="text-gray-700">
                      {isChild 
                        ? "Thank you for completing the family assessment! Your responses are helping create stronger family connections."
                        : "Your family assessment responses have been recorded and are being used to provide personalized insights."}
                    </p>
                  </div>
                  <Button
                    onClick={handleReturnToDashboard}
                    size="lg"
                    className={`${isChild ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold shadow-lg rounded-full px-8 py-3 text-lg`}
                  >
                    Return to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        variants={fadeUp}
        className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-md z-10 relative"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReturnToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FamilyConnect</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">
            {profile?.full_name.split(' ')[0]}
          </span>
        </div>
      </motion.nav>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "visible"}
            variants={fadeUp}
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 font-bold text-center">Family Conversation</CardTitle>
                <CardDescription className="text-gray-700 text-center">
                  Answer the questions below to help us understand your family better.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ConversationQuestions component renders the questions and handles answers */}
                <ConversationQuestions onComplete={handleConversationComplete} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
