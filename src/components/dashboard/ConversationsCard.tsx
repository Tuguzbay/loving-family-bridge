import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ConversationsCardProps {
  isChild: boolean;
  hasCompletedConversation: boolean;
  conversationCompletion: any;
  isParent?: boolean;
  hasCompletedAnyParentChildAssessment?: boolean;
}

export const ConversationsCard = ({ isChild, hasCompletedConversation, conversationCompletion, isParent, hasCompletedAnyParentChildAssessment }: ConversationsCardProps) => {
  // For parents, check if they have completed either the general conversation OR any parent-child assessment
  const hasAnyCompletion = hasCompletedConversation || (isParent && hasCompletedAnyParentChildAssessment);
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          {isChild ? "Your Conversations" : "Active Conversations"}
        </CardTitle>
        <CardDescription>
          Continue your family communication journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`border rounded-lg p-4 ${hasAnyCompletion ? 'bg-green-50' : (isChild ? 'bg-purple-50' : 'bg-blue-50')}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800">
              {isChild ? "Family Assessment" : "Initial Family Assessment"}
            </h3>
            <Badge variant="secondary" className={`${hasAnyCompletion ? 'bg-green-100 text-green-800' : (isChild ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800')}`}>
              {hasAnyCompletion ? 'Completed' : 'Ready to Start'}
            </Badge>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            {hasAnyCompletion ? (
              isChild 
                ? "Great job! You've completed your family assessment."
                : isParent && hasCompletedAnyParentChildAssessment && !hasCompletedConversation
                  ? "You've completed parent-child assessments. You can also complete the general family assessment if desired."
                  : "Assessment completed successfully."
            ) : (
              isChild 
                ? "Share your thoughts to help our AI understand your family better."
                : "Complete the guided conversation to help our AI understand your family dynamics."
            )}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {hasCompletedConversation ? `Completed ${new Date(conversationCompletion.completed_at).toLocaleDateString()}` : 
               (isParent && hasCompletedAnyParentChildAssessment && !hasCompletedConversation) ? 'Parent-child assessments completed' :
               'Not started'}
            </span>
            {!hasCompletedConversation && (
              <Link to="/conversation">
                <Button size="sm" className={`${isChild ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isParent && hasCompletedAnyParentChildAssessment ? 'Complete General Assessment' : 'Start Conversation'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${hasAnyCompletion ? 'bg-blue-50' : 'bg-gray-50 opacity-60'}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`font-semibold ${hasAnyCompletion ? 'text-gray-800' : 'text-gray-600'}`}>
              {isChild ? "Private Insights" : "Private Insights Session"}
            </h3>
            <Badge variant="outline" className={`${hasAnyCompletion ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-500'}`}>
              {hasAnyCompletion ? 'Available' : 'Locked'}
            </Badge>
          </div>
          <p className={`text-sm ${hasAnyCompletion ? 'text-gray-600' : 'text-gray-500'}`}>
            {hasAnyCompletion 
              ? 'View personalized insights based on your assessment.'
              : 'Available after completing the initial assessment.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};