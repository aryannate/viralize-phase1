import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  audience_type?: string;
  audience_age?: string;
  audience_size?: string;
  niche?: string;
  interests?: string;
  brand_collaborations?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  ensureProfileExists: (userId: string, userData: any) => Promise<User>;
  autoLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ensureProfileExists = async (userId: string, userData: any): Promise<User> => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        return existingProfile as User;
      }
      
      if (fetchError && fetchError.code === 'PGRST116') {
        const name = userData?.name || userData?.user_metadata?.name || 'User';
        const email = userData?.email || '';
        
        const newProfile = {
          id: userId,
          name,
          email,
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createError) throw createError;
        
        return createdProfile as User;
      }
      
      throw fetchError;
    } catch (error) {
      console.error("Error ensuring profile exists:", error);
      throw error;
    }
  };

  const autoLogin = async () => {
    try {
      setIsLoading(true);
      
      const dummyUser: User = {
        id: "auto-login-user-id",
        email: "auto@example.com",
        name: "Auto User",
      };
      
      setUser(dummyUser);
      setIsAuthenticated(true);
      
      toast({
        title: "Auto login successful",
        description: "Welcome to Viralize!",
      });
    } catch (error: any) {
      console.error("Auto login error:", error);
      toast({
        title: "Auto login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Confirmation email sent",
        description: "Please check your inbox for the verification email.",
      });
      
    } catch (error: any) {
      toast({
        title: "Failed to resend confirmation email",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
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
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
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

  return (
    <AuthContext.Provider value={{ 
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};
