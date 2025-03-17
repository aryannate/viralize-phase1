
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail } from "lucide-react";

const Auth = () => {
  const { login, signup, resendConfirmationEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailNeedsConfirmation, setEmailNeedsConfirmation] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  
  // Check if redirected after email confirmation
  const errorDescription = searchParams.get("error_description");
  const isEmailConfirmationError = errorDescription?.includes("Email not confirmed");
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleResendConfirmation = async () => {
    const email = unconfirmedEmail || loginData.email;
    if (!email) {
      toast({
        title: "Email required",
        description: "Please provide your email to resend the confirmation link.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await resendConfirmationEmail(email);
    } catch (error) {
      console.error("Error resending confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      await login(loginData.email, loginData.password);
      
      navigate("/dashboard");
    } catch (error: any) {
      if (error.message === "EMAIL_NOT_CONFIRMED") {
        setEmailNeedsConfirmation(true);
        setUnconfirmedEmail(loginData.email);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Signup failed",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await signup(signupData.name, signupData.email, signupData.password);
      
      // If we get here without error, it could mean either:
      // 1. User was created and email confirmation was sent (production)
      // 2. User was created and auto-logged in (development with email confirmation disabled)
      
      toast({
        title: "Account created",
        description: "Welcome to your AI Influencer Dashboard!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by the signup function
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Viralize</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account or create a new one</p>
        </div>
        
        {(emailNeedsConfirmation || isEmailConfirmationError) && (
          <Alert className="mb-4 border-amber-500 text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
            <Mail className="h-4 w-4" />
            <AlertTitle>Email verification required</AlertTitle>
            <AlertDescription>
              Please check your inbox and verify your email before logging in.
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-amber-800 dark:text-amber-400 mt-1" 
                onClick={handleResendConfirmation}
                disabled={isLoading}
              >
                Resend verification email
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Sign up for a free account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      placeholder="John Smith"
                      required
                      value={signupData.name}
                      onChange={handleSignupChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={signupData.email}
                      onChange={handleSignupChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      value={signupData.password}
                      onChange={handleSignupChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    By signing up, you'll receive a verification email. Please check your inbox after registration.
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
