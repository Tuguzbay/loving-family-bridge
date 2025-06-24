
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, MessageCircle, Users, Calendar, ArrowRight, User, LogOut, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleProfile } from "@/hooks/useSimpleProfile";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";
import { FamilyCodeInput } from "@/components/FamilyCodeInput";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useSimpleProfile();
  const { 
    family, 
    familyMembers, 
    conversationCompletion, 
    loading: familyLoading, 
    createFamily, 
    joinFamily 
  } = useFamily();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

  const loading = profileLoading || familyLoading;

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreateFamily = async () => {
    setIsCreatingFamily(true);
    
    try {
      const { error } = await createFamily();
      
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

  const handleJoinFamily = async (familyCode: string) => {
    const result = await joinFamily(familyCode);
    
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
    }
    
    return result;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isChild = profile.user_type === 'child';
  const isParent = profile.user_type === 'parent';
  const hasCompletedConversation = !!conversationCompletion;
  const conversationProgress = hasCompletedConversation ? 100 : 0;

  console.log('Dashboard render - Current state:', { 
    isChild, 
    family: family?.family_code, 
    familyMembers: familyMembers.length,
    hasCompletedConversation 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">FamilyConnect</span>
          {isChild && (
            <Badge className="bg-purple-100 text-purple-800 ml-2">
              <Star className="h-3 w-3 mr-1" />
              Child
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {profile.full_name.split(' ')[0]}!</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isChild ? `Hi ${profile.full_name.split(' ')[0]}! 🌟` : `Welcome back, ${profile.full_name.split(' ')[0]}! 👋`}
          </h1>
          <p className="text-gray-600">
            {isChild 
              ? "Let's continue building stronger connections with your family!"
              : "Continue building stronger connections with your family."
            }
          </p>
        </div>

        {/* Family Setup Section - Show only if user isn't in a family */}
        {!family && (
          <div className="mb-8">
            {isParent ? (
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
            ) : (
              <FamilyCodeInput 
                onJoinFamily={handleJoinFamily}
                isLoading={familyLoading}
              />
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Family Code
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {family?.family_code || (isChild ? "Not Connected" : "Not Created")}
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
                Progress
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{conversationProgress}%</div>
              <p className="text-xs text-gray-500 mt-2">
                Conversation progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Conversations */}
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
              <div className={`border rounded-lg p-4 ${hasCompletedConversation ? 'bg-green-50' : (isChild ? 'bg-purple-50' : 'bg-blue-50')}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {isChild ? "Family Assessment" : "Initial Family Assessment"}
                  </h3>
                  <Badge variant="secondary" className={`${hasCompletedConversation ? 'bg-green-100 text-green-800' : (isChild ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800')}`}>
                    {hasCompletedConversation ? 'Completed' : 'Ready to Start'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {hasCompletedConversation ? (
                    isChild 
                      ? "Great job! You've completed your family assessment."
                      : "Assessment completed successfully."
                  ) : (
                    isChild 
                      ? "Share your thoughts to help our AI understand your family better."
                      : "Complete the guided conversation to help our AI understand your family dynamics."
                  )}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {hasCompletedConversation ? `Completed ${new Date(conversationCompletion.completed_at).toLocaleDateString()}` : 'Not started'}
                  </span>
                  {!hasCompletedConversation && (
                    <Link to="/conversation">
                      <Button size="sm" className={`${isChild ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        Start Conversation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className={`border rounded-lg p-4 ${hasCompletedConversation ? 'bg-blue-50' : 'bg-gray-50 opacity-60'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${hasCompletedConversation ? 'text-gray-800' : 'text-gray-600'}`}>
                    {isChild ? "Private Insights" : "Private Insights Session"}
                  </h3>
                  <Badge variant="outline" className={`${hasCompletedConversation ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-500'}`}>
                    {hasCompletedConversation ? 'Available' : 'Locked'}
                  </Badge>
                </div>
                <p className={`text-sm ${hasCompletedConversation ? 'text-gray-600' : 'text-gray-500'}`}>
                  {hasCompletedConversation 
                    ? 'View personalized insights based on your assessment.'
                    : 'Available after completing the initial assessment.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Family Members */}
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
        </div>

        {/* Quick Actions */}
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
            <div className="grid md:grid-cols-3 gap-4">
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
              <Button variant="outline" className="h-20 flex-col space-y-2" disabled={!hasCompletedConversation}>
                <Heart className="h-6 w-6 text-red-500" />
                <span>{isChild ? "Family Insights" : "View Insights"}</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                <Calendar className="h-6 w-6 text-purple-600" />
                <span>{isChild ? "Family Time" : "Schedule Family Time"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
