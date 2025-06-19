
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Send, ArrowLeft, Users, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  sender: "ai" | "parent" | "child";
  content: string;
  timestamp: Date;
  senderName?: string;
}

const Conversation = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      content: "Welcome to your family conversation space! I'm here to help facilitate meaningful discussions between you and your family member. Let's start with something simple - can you both tell me what you're most looking forward to about improving your family communication?",
      timestamp: new Date(),
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [progress, setProgress] = useState(65);
  const [activeUsers] = useState([
    { name: "Sarah (Parent)", status: "online" },
    { name: "Emma (Child)", status: "online" }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversation questions to simulate AI flow
  const conversationQuestions = [
    "What time of day do you both feel most comfortable talking to each other?",
    "Can you each share one thing you appreciate about the other person?",
    "What's one topic you'd like to understand better about each other?",
    "How do you both prefer to handle disagreements or conflicts?",
    "What's something fun you'd both like to do together more often?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: Math.random() > 0.5 ? "parent" : "child", // Simulate different users
      content: currentMessage,
      timestamp: new Date(),
      senderName: Math.random() > 0.5 ? "Sarah" : "Emma"
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate AI response after a delay
    setTimeout(() => {
      const randomQuestion = conversationQuestions[Math.floor(Math.random() * conversationQuestions.length)];
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: `Thank you for sharing that! ${randomQuestion}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setProgress(prev => Math.min(prev + 5, 100));
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Family Conversation</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">{activeUsers.length} participants online</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-gray-800">Initial Family Assessment</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">
                {progress}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
        </Card>

        {/* Active Participants */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">Active Participants:</span>
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-gray-800">Guided Conversation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "ai" ? "justify-center" : 
                    message.sender === "parent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "ai"
                        ? "bg-blue-100 text-blue-900 border border-blue-200"
                        : message.sender === "parent"
                        ? "bg-blue-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {(message.sender === "parent" || message.sender === "child") && (
                      <div className="text-xs opacity-75 mb-1">
                        {message.senderName}
                      </div>
                    )}
                    <div className={message.sender === "ai" ? "text-center" : ""}>
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 opacity-75 ${message.sender === "ai" ? "text-center" : ""}`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Type your response here..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Take your time to think about your responses. 
                There are no right or wrong answers - just be honest and open with each other.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Conversation;
