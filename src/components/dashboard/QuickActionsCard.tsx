import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { Profile } from "@/types/profile";

interface QuickActionsCardProps {
  isChild: boolean;
  isParent: boolean;
  family: any;
  familyMembers: any[];
  childAssessments: Record<string, boolean>;
  childCompletions: Record<string, boolean>;
  onSelectInsightChild: (child: Profile) => void;
  currentUserId?: string; // Add current user ID
}

export const QuickActionsCard = ({ 
  isChild, 
  isParent, 
  family, 
  familyMembers, 
  childAssessments,
  childCompletions,
  onSelectInsightChild,
  currentUserId
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
        <div className="grid md:grid-cols-1 gap-4">
          
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
          ) : isChild && family && familyMembers.length > 0 ? (
            // For children, show insights for themselves if available
            (() => {
              // Find current child user by matching their user ID
              const currentUser = familyMembers.find(member => 
                member.profiles.user_type === 'child' && 
                member.profiles.id === currentUserId
              );
              if (currentUser) {
                const parentCompleted = childAssessments[currentUser.profiles.id] || false;
                const childCompleted = childCompletions[currentUser.profiles.id] || false;
                const hasInsights = parentCompleted && childCompleted;
                
                console.log(`Child insight availability:`, {
                  childId: currentUser.profiles.id,
                  childName: currentUser.profiles.full_name,
                  parentCompleted,
                  childCompleted, 
                  hasInsights
                });
                
                return (
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 w-full" 
                    disabled={!hasInsights}
                    onClick={() => hasInsights && onSelectInsightChild(currentUser.profiles)}
                  >
                    <Heart className="h-6 w-6 text-red-500" />
                    <span>My Family Insights</span>
                  </Button>
                );
              }
              return (
                <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                  <Heart className="h-6 w-6 text-red-500" />
                  <span>Family Insights</span>
                </Button>
              );
            })()
          ) : (
            <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
              <Heart className="h-6 w-6 text-red-500" />
              <span>View Insights</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};