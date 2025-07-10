
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectTheDotsBackground from "@/components/ConnectTheDotsBackground";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Connect-the-Dots Background */}
      <ConnectTheDotsBackground />
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-md z-10 relative">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600 drop-shadow-lg" />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FamilyConnect</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-semibold">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-xl">
            Bridge the Gap Between
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"> Parents & Children</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-8 leading-relaxed font-medium drop-shadow-sm">
            An AI-powered family communication platform that helps parents and children 
            understand each other better through guided conversations and personalized insights.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-10 py-5 text-2xl font-bold shadow-xl rounded-full">
              Start Your Journey
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl hover:shadow-3xl transition-all duration-300 rounded-3xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900 font-bold">Guided Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700 text-center leading-relaxed font-medium">
                Our AI facilitates meaningful conversations between family members, asking the right questions to uncover deeper understanding.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl hover:shadow-3xl transition-all duration-300 rounded-3xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900 font-bold">Personalized Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700 text-center leading-relaxed font-medium">
                Receive tailored recommendations and insights based on your family's unique communication patterns and preferences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl hover:shadow-3xl transition-all duration-300 rounded-3xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900 font-bold">Stronger Bonds</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700 text-center leading-relaxed font-medium">
                Build deeper connections through improved understanding, better communication, and shared activities tailored to your family.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12 drop-shadow-lg">How FamilyConnect Works</h2>
          <div className="grid md:grid-cols-4 gap-10">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">1</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Register Together</h3>
              <p className="text-gray-700 text-base">Parent and child create linked accounts</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">2</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Join Conversation</h3>
              <p className="text-gray-700 text-base">Participate in guided discussions together</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">3</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Get Insights</h3>
              <p className="text-gray-700 text-base">AI analyzes responses and identifies patterns</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">4</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Improve Together</h3>
              <p className="text-gray-700 text-base">Follow personalized recommendations</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/70 backdrop-blur-2xl rounded-3xl p-16 shadow-2xl z-10 relative border border-blue-100">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to Strengthen Your Family Bond?</h2>
          <p className="text-2xl text-gray-700 mb-8">Join thousands of families who are already communicating better.</p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-10 py-5 text-2xl font-bold shadow-xl rounded-full">
              Start Your Free Journey
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/90 text-white py-12 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">FamilyConnect</span>
          </div>
          <p className="text-gray-400">Bringing families closer, one conversation at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
