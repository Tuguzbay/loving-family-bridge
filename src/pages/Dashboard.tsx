
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, MessageCircle, Users, Calendar, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock user data - in real app this would come from authentication
  const [user] = useState({
    name: "Sarah Johnson",
    type: "parent", // or "child"
    familyMembers: [
      { name: "Emma Johnson", age: 14, relationship: "daughter", status: "active" }
    ],
    conversationProgress: 65,
    lastActivity: "2 hours ago"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">FamilyConnect</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {user.name}</span>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Continue building stronger connections with your family.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversation Progress
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{user.conversationProgress}%</div>
              <Progress value={user.conversationProgress} className="mt-2" />
              <p className="text-xs text-gray-500 mt-2">
                Initial assessment in progress
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
              <div className="text-2xl font-bold text-gray-800">{user.familyMembers.length}</div>
              <p className="text-xs text-gray-500 mt-2">
                Active family connections
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Activity
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{user.lastActivity}</div>
              <p className="text-xs text-gray-500 mt-2">
                Recent family interaction
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
                    In Progress
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Complete the guided conversation to help our AI understand your family dynamics.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">65% Complete</span>
                  <Link to="/conversation">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Continue
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
              {user.familyMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-600">
                        {member.age} years old • {member.relationship}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {member.status}
                  </Badge>
                </div>
              ))}

              <Button variant="outline" className="w-full border-dashed border-gray-300 text-gray-600">
                + Invite Another Family Member
              </Button>
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
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <span>Start New Conversation</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Heart className="h-6 w-6 text-red-500" />
                <span>View Insights</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                <span>Schedule Family Time</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
