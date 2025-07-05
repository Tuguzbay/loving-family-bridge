import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Profile } from "@/types/profile";

interface ParentChildAssessmentsCardProps {
  familyMembers: any[];
  childAssessments: Record<string, boolean>;
  onSelectChild: (child: Profile) => void;
}

export const ParentChildAssessmentsCard = ({ familyMembers, childAssessments, onSelectChild }: ParentChildAssessmentsCardProps) => {
  const children = familyMembers.filter(member => member.profiles.user_type === 'child');
  
  if (children.length === 0) return null;

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-8">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          Parent-Child Assessments
        </CardTitle>
        <CardDescription>
          Complete separate assessments for each child to get personalized insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children.map((child) => {
          const isCompleted = childAssessments[child.profiles.id];
          return (
            <div key={child.profiles.id} className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">
                  Assessment for {child.profiles.full_name}
                </h3>
                <Badge variant="secondary" className={`${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isCompleted ? 'Completed' : 'Ready to Start'}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {isCompleted 
                  ? "You've completed this assessment. Your responses are locked and cannot be changed."
                  : "Share your perspective on your relationship with this child."
                }
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Age: {child.profiles.age || 'Not specified'}
                </span>
                {!isCompleted ? (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => onSelectChild(child.profiles)}
                  >
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Assessment Complete
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};