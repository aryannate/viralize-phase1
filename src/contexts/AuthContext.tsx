
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  audienceType?: string;
  audienceAge?: string;
  audienceSize?: string;
  niche?: string;
  interests?: string;
  brandCollaborations?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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

  // Check for active Supabase session on initial load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const userProfile = {
            id: userData.user.id,
            email: userData.user.email || '',
            name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || '',
            avatar: userData.user.user_metadata?.avatar_url,
          };
          setUser(userProfile);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(userProfile));
        }
      } else {
        // Check for saved user as fallback
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
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
            const userProfile = {
              id: userData.user.id,
              email: userData.user.email || '',
              name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || '',
              avatar: userData.user.user_metadata?.avatar_url,
            };
            setUser(userProfile);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(userProfile));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function using Supabase
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
          avatar: data.user.user_metadata?.avatar_url,
        };
        
        setUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userProfile));
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
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
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: name || data.user.email?.split('@')[0] || '',
          avatar: data.user.user_metadata?.avatar_url,
        };
        
        // For development mode without email verification
        if (data.session) {
          setUser(userProfile);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(userProfile));
          
          toast({
            title: "Account created successfully",
            description: "Welcome to the platform!",
          });
        } else {
          toast({
            title: "Verification email sent",
            description: "Please check your email to verify your account.",
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

  // Logout function using Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
