import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    parentEmail: "",
    familyCode: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleUserTypeSelect = (type: string) => {
    setUserType(type);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Starting registration process for:', userType);
      
      // Prepare user metadata
      const userData = {
        full_name: formData.name,
        user_type: userType,
        age: formData.age ? parseInt(formData.age) : null,
        family_code: userType === "child" ? formData.familyCode : null
      };

      console.log('User data for signup:', userData);

      // Sign up user
      const { error: signUpError } = await signUp(formData.email, formData.password, userData);
      
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        setIsLoading(false);
        return;
      }

      console.log('User signed up successfully');

      // Show success message for email confirmation
      toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account, then sign in.",
      });

      // Redirect to login page
      navigate("/login");

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">FamilyConnect</span>
          </div>
        </div>

        {step === 1 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">Join FamilyConnect</CardTitle>
              <CardDescription className="text-gray-600">
                Are you a parent or child joining the family?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleUserTypeSelect("parent")}
                className="w-full h-16 text-left bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-gray-800"
                variant="outline"
              >
                <div>
                  <div className="font-semibold">I'm a Parent</div>
                  <div className="text-sm text-gray-600">Create a family account and invite your child</div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleUserTypeSelect("child")}
                className="w-full h-16 text-left bg-green-50 hover:bg-green-100 border-2 border-green-200 text-gray-800"
                variant="outline"
              >
                <div>
                  <div className="font-semibold">I'm a Child/Teen</div>
                  <div className="text-sm text-gray-600">Join my parent's family account</div>
                </div>
              </Button>

              <div className="text-center pt-4">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm">
                  Already have an account? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">
                {userType === "parent" ? "Create Parent Account" : "Create Child Account"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {userType === "parent" 
                  ? "Set up your family account to get started"
                  : "Join your family to start connecting better"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a secure password"
                    required
                  />
                </div>

                {userType === "child" && (
                  <>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Select onValueChange={(value) => handleInputChange("age", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your age" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 16 }, (_, i) => i + 8).map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age} years old
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="familyCode">Family Code</Label>
                      <Input
                        id="familyCode"
                        type="text"
                        value={formData.familyCode}
                        onChange={(e) => handleInputChange("familyCode", e.target.value)}
                        placeholder="Enter the family code from your parent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ask your parent for the family code they received
                      </p>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? "Creating Account..." 
                    : userType === "parent" ? "Create Family Account" : "Join Family"
                  }
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Register;
