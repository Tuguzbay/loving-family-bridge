import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Copy, Check, Heart, UserCheck } from "lucide-react";
import { useFamilyCodeCopy } from "@/hooks/useFamilyCodeCopy";

interface StatsCardsProps {
  family: any;
  familyMembers: any[];
  conversationProgress: number;
  isChild: boolean;
}

export const StatsCards = ({ family, familyMembers, conversationProgress, isChild }: StatsCardsProps) => {
  const { copiedCode, handleCopyFamilyCode } = useFamilyCodeCopy();

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Family Code
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {family?.family_code || (isChild ? "Not Connected" : "Not Created")}
            </div>
            {family?.family_code && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyFamilyCode(family.family_code)}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {family ? (isChild ? "Your family code" : "Share with family members") : (isChild ? "Join a family first" : "Create a family first")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Family Members
          </CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">{familyMembers.length || 0}</div>
          <p className="text-xs text-gray-500 mt-2">
            Connected family members
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Family Connection
          </CardTitle>
          <Heart className="h-4 w-4 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-1 py-2">
            {/* Happy Family Animation */}
            <div className="flex items-center space-x-2 animate-pulse">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <Heart className="h-3 w-3 text-pink-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-purple-600" />
              </div>
              <Heart className="h-3 w-3 text-pink-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Building stronger connections
          </p>
        </CardContent>
      </Card>
    </div>
  );
};