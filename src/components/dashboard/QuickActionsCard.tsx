import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Profile } from "@/types/profile";

interface QuickActionsCardProps {
  isChild: boolean;
  isParent: boolean;
  hasCompletedConversation: boolean;
  family: any;
  familyMembers: any[];
  childAssessments: Record<string, boolean>;
  childCompletions: Record<string, boolean>;
  onSelectInsightChild: (child: Profile) => void;
}

export const QuickActionsCard = ({ 
  isChild, 
  isParent, 
  hasCompletedConversation, 
  family, 
  familyMembers, 
  childAssessments,
  childCompletions,
  onSelectInsightChild 
}: QuickActionsCardProps) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-8">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          {isChild ? "What You Can Do" : "Quick Actions"}
        </CardTitle>
        <CardDescription>
          {isChild 
            ? "Fun ways to connect with your family"
            : "Common tasks to improve family communication"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {!hasCompletedConversation ? (
            <Link to="/conversation">
              <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                <MessageCircle className={`h-6 w-6 ${isChild ? 'text-purple-600' : 'text-blue-600'}`} />
                <span>{isChild ? "Start Chatting" : "Start Conversation"}</span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span>Assessment Complete</span>
            </Button>
          )}
          
          {isParent && family && familyMembers.some(member => member.profiles.user_type === 'child') ? (
            <div className="space-y-2">
              {familyMembers
                .filter(member => member.profiles.user_type === 'child')
                .map((child) => {
                  // Check if both parent and child have completed their assessments
                  const parentCompleted = childAssessments[child.profiles.id] || false;
                  const childCompleted = childCompletions[child.profiles.id] || false;
                  const hasInsights = parentCompleted && childCompleted;
                  
                  console.log(`Insight availability for ${child.profiles.full_name}:`, {
                    parentCompleted,
                    childCompleted, 
                    hasInsights
                  });
                  return (
                    <Button 
                      key={child.profiles.id}
                      variant="outline" 
                      className="h-20 flex-col space-y-2 w-full" 
                      disabled={!hasInsights}
                      onClick={() => onSelectInsightChild(child.profiles)}
                    >
                      <Heart className="h-6 w-6 text-red-500" />
                      <span>Insights for {child.profiles.full_name}</span>
                    </Button>
                  );
                })}
            </div>
          ) : (
            <Button variant="outline" className="h-20 flex-col space-y-2" disabled={!hasCompletedConversation}>
              <Heart className="h-6 w-6 text-red-500" />
              <span>{isChild ? "Family Insights" : "View Insights"}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};