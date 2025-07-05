import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface FamilyMembersCardProps {
  isChild: boolean;
  familyMembers: any[];
  family: any;
  user: any;
}

export const FamilyMembersCard = ({ isChild, familyMembers, family, user }: FamilyMembersCardProps) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          {isChild ? "My Family" : "Family Members"}
        </CardTitle>
        <CardDescription>
          Your connected family network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {familyMembers.length > 0 ? (
          familyMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{member.profiles.full_name}</h3>
                  <p className="text-sm text-gray-600">
                    {member.profiles.age && `${member.profiles.age} years old • `}
                    {member.profiles.user_type === 'parent' ? 'Parent' : 'Child'}
                    {member.user_id === user?.id && ' (You)'}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">
              {isChild ? "Not connected to a family yet" : "No family members yet"}
            </p>
            <p className="text-sm text-gray-400">
              {family ? `Family code: ${family.family_code}` : (isChild ? "Use a family code to join" : "Create a family to get started")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};