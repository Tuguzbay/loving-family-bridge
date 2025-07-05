import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FamilyCodeInput } from "@/components/FamilyCodeInput";

interface FamilySetupCardProps {
  isParent: boolean;
  onCreateFamily: () => Promise<{ error?: string }>;
  onJoinFamily: (familyCode: string) => Promise<{ error?: string; data?: any }>;
  familyLoading: boolean;
}

export const FamilySetupCard = ({ isParent, onCreateFamily, onJoinFamily, familyLoading }: FamilySetupCardProps) => {
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async () => {
    setIsCreatingFamily(true);
    
    try {
      const { error } = await onCreateFamily();
      
      if (error) {
        toast({
          title: "Error Creating Family",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Family Created Successfully!",
          description: "Your family has been created. Share your family code with your child.",
        });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong while creating your family.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingFamily(false);
    }
  };

  if (isParent) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Set Up Your Family
          </CardTitle>
          <CardDescription>
            Create your family and get a code to share with your child
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 border-2 border-dashed border-blue-300 rounded-lg">
            <p className="text-gray-600 mb-4">
              You haven't created your family yet. Once you do, you'll get a family code to share with your child.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateFamily}
              disabled={isCreatingFamily}
            >
              {isCreatingFamily ? "Creating Family..." : "Create Family"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FamilyCodeInput 
      onJoinFamily={onJoinFamily}
      isLoading={familyLoading}
    />
  );
};