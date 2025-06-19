import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, MessageCircle, Users, Calendar, ArrowRight, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, family, familyMembers, loading, createFamily } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

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

  const otherFamilyMembers = familyMembers.filter(member => member.user_id !== user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">FamilyConnect</span>
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
            Welcome back, {profile.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Continue building stronger connections with your family.
          </p>
        </div>

        {!family && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Set Up Your Family
              </CardTitle>
              <CardDescription>
                {profile.user_type === 'parent' 
                  ? "Create your family and get a code to share with your child"
                  : "Join your family using the code from your parent"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.user_type === 'parent' ? (
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
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-green-300 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Ask your parent for the family code and enter it during registration to join your family.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {family && (
          <>
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
                  <div className="text-2xl font-bold text-gray-800">{family.family_code}</div>
                  <p className="text-xs text-gray-500 mt-2">
                    Share with family members
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
                  <div className="text-2xl font-bold text-gray-800">{familyMembers.length}</div>
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
                  <div className="text-2xl font-bold text-gray-800">0%</div>
                  <p className="text-xs text-gray-500 mt-2">
                    Conversation progress
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Current Conversations */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Active Conversations</CardTitle>
                  <CardDescription>
                    Continue your family communication journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">Initial Family Assessment</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Ready to Start
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Complete the guided conversation to help our AI understand your family dynamics.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Not started</span>
                      <Link to="/conversation">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Start Conversation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 opacity-60">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-600">Private Insights Session</h3>
                      <Badge variant="outline" className="border-gray-300 text-gray-500">
                        Locked
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Available after completing the initial assessment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Family Members */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Family Members</CardTitle>
                  <CardDescription>
                    Your connected family network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {otherFamilyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{member.profiles.full_name}</h3>
                          <p className="text-sm text-gray-600">
                            {member.profiles.age && `${member.profiles.age} years old • `}
                            {member.profiles.user_type}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  ))}

                  {otherFamilyMembers.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-2">No other family members yet</p>
                      <p className="text-sm text-gray-400">
                        Share your family code: <strong>{family.family_code}</strong>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-8">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to improve family communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link to="/conversation">
                    <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                      <span>Start Conversation</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                    <Heart className="h-6 w-6 text-red-500" />
                    <span>View Insights</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <span>Schedule Family Time</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
