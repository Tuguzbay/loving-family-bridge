
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, User, Baby } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

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
  const shouldReduceMotion = useReducedMotion();

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
      const userData: {
        full_name: string;
        user_type: string;
        age: number | null;
        family_code?: string;
      } = {
        full_name: formData.name,
        user_type: userType,
        age: formData.age ? parseInt(formData.age) : null,
      };
      if (userType === "child" && formData.familyCode.trim()) {
        userData.family_code = formData.familyCode.trim();
      }
      const { error: signUpError } = await signUp(formData.email, formData.password, userData);
      if (signUpError) {
        setIsLoading(false);
        return;
      }
      toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account, then sign in.",
      });
      navigate("/login");
    } catch (error) {
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
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FamilyConnect</span>
          </div>
        </div>
        {step === 1 && (
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "visible"}
            variants={fadeUp}
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-2xl rounded-3xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900 font-bold">Join FamilyConnect</CardTitle>
                <CardDescription className="text-gray-700">
                  Are you a parent or child joining the family?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleUserTypeSelect("parent")}
                  className="w-full h-16 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-gray-800 flex items-center justify-start"
                  variant="outline"
                >
                  <User className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">I'm a Parent</div>
                    <div className="text-xs sm:text-sm text-gray-600">Create a family account and invite your child</div>
                  </div>
                </Button>
                <Button
                  onClick={() => handleUserTypeSelect("child")}
                  className="w-full h-16 bg-green-50 hover:bg-green-100 border-2 border-green-200 text-gray-800 flex items-center justify-start"
                  variant="outline"
                >
                  <Baby className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">I'm a Child/Teen</div>
                    <div className="text-xs sm:text-sm text-gray-600">Join my parent's family account</div>
                  </div>
                </Button>
                <div className="text-center pt-4">
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm">
                    Already have an account? Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "visible"}
            variants={fadeUp}
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-2xl rounded-3xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900 font-bold">
                  {userType === "parent" ? "Create Parent Account" : "Create Child Account"}
                </CardTitle>
                <CardDescription className="text-gray-700">
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
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  {userType === "parent" && (
                    <div>
                      <Label htmlFor="age">Your Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="Enter your age"
                        min={18}
                        required
                      />
                    </div>
                  )}
                  {userType === "child" && (
                    <div>
                      <Label htmlFor="age">Your Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="Enter your age"
                        min={6}
                        required
                      />
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold shadow-lg rounded-full py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Register;
