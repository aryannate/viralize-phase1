
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { 
  ensureProfileExists, 
  performAutoLogin, 
  updateUserProfile, 
  resendEmailConfirmation 
} from "@/utils/authUtils";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const autoLogin = async () => {
    try {
      setIsLoading(true);
      const dummyUser = await performAutoLogin();
      setUser(dummyUser);
      setIsAuthenticated(true);
      return dummyUser;
    } catch (error) {
      console.error("Auto login error in provider:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await autoLogin();
  };

  const signup = async (name: string, email: string, password: string) => {
    await autoLogin();
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error("No user logged in");
      await updateUserProfile(user, data);
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const resendConfirmationEmail = async (email: string) => {
    await resendEmailConfirmation(email);
  };

  return { 
    user, 
    isAuthenticated,
    isLoading,
    login, 
    signup, 
    logout,
    updateProfile,
    resendConfirmationEmail,
    ensureProfileExists,
    autoLogin
  };
};
