
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const { autoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto login when the page loads
    const performAutoLogin = async () => {
      await autoLogin();
      navigate("/dashboard");
    };
    
    performAutoLogin();
  }, [autoLogin, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-2xl font-semibold">Logging you in automatically...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your dashboard.</p>
      </div>
    </div>
  );
};

export default Auth;
