
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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
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

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Check for active Supabase session on initial load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          // Fetch user profile from the profiles table
          const profileData = await fetchUserProfile(userData.user.id);
          
          if (profileData) {
            setUser(profileData);
            setIsAuthenticated(true);
          }
        }
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            // Fetch profile data after sign in
            const profileData = await fetchUserProfile(userData.user.id);
            
            if (profileData) {
              setUser(profileData);
              setIsAuthenticated(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to resend confirmation email
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

  // Login function using Supabase
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not confirmed",
            description: "Please check your inbox and confirm your email before logging in. You can also request a new confirmation email.",
            variant: "destructive",
          });
          throw new Error("EMAIL_NOT_CONFIRMED");
        }
        throw error;
      }
      
      if (data.user) {
        // Fetch profile after login
        const profileData = await fetchUserProfile(data.user.id);
        
        if (profileData) {
          setUser(profileData);
          setIsAuthenticated(true);
          
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
        }
      }
    } catch (error: any) {
      // If it's not the specific email confirmation error we already handled
      if (error.message !== "EMAIL_NOT_CONFIRMED") {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Signup function using Supabase
  const signup = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Setting emailRedirectTo ensures the user is redirected back to your app after confirming
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Development mode flow - if session exists, user can login immediately without confirmation
        if (data.session) {
          // Fetch the newly created profile
          const profileData = await fetchUserProfile(data.user.id);
          
          if (profileData) {
            setUser(profileData);
            setIsAuthenticated(true);
            
            toast({
              title: "Account created successfully",
              description: "Welcome to Viralize!",
            });
          }
        } else {
          toast({
            title: "Verification email sent",
            description: "Please check your email to verify your account. You can login after verifying your email.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state with new data
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
    }
  };

  // Logout function using Supabase
  const logout = async () => {
    await supabase.auth.signOut();
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
      login, 
      signup, 
      logout,
      updateProfile,
      resendConfirmationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};
