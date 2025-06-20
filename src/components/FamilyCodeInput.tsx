
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FamilyCodeInputProps {
  onJoinFamily: (familyCode: string) => Promise<{ error?: string; data?: any }>;
  isLoading?: boolean;
}

interface FormData {
  familyCode: string;
}

export const FamilyCodeInput = ({ onJoinFamily, isLoading }: FamilyCodeInputProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    defaultValues: {
      familyCode: ""
    }
  });

  const handleJoinFamily = async (data: FormData) => {
    if (!data.familyCode.trim()) {
      toast({
        title: "Family Code Required",
        description: "Please enter a family code.",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    
    try {
      const result = await onJoinFamily(data.familyCode.trim());
      
      if (result.error) {
        toast({
          title: "Failed to Join Family",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Successfully Joined Family! 🎉",
          description: "Welcome to your family! You can now start the conversation.",
        });
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong while joining the family.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Join Your Family
        </CardTitle>
        <CardDescription>
          Ask your parent for the family code to join your family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleJoinFamily)} className="space-y-4">
            <FormField
              control={form.control}
              name="familyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter family code (e.g., FAM-2024-ABC12345)"
                      {...field}
                      disabled={isJoining || isLoading}
                      className="text-center font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isJoining || isLoading}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Family...
                </>
              ) : (
                "Join Family"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
