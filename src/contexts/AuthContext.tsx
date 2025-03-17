
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
  isLoading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  ensureProfileExists: (userId: string, userData: any) => Promise<User>; // New helper
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  // Helper function to create or get a user profile
  const ensureProfileExists = async (userId: string, userData: any): Promise<User> => {
    try {
      // First try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // If profile exists, return it
      if (existingProfile) {
        return existingProfile as User;
      }
      
      // If no profile exists, create one
      if (fetchError && fetchError.code === 'PGRST116') {
        const name = userData?.name || userData?.user_metadata?.name || 'User';
        const email = userData?.email || '';
        
        const newProfile: Partial<User> = {
          id: userId,
          name,
          email,
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
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
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user) {
            try {
              // First try to fetch profile
              const profileData = await fetchUserProfile(userData.user.id);
              
              if (profileData) {
                setUser(profileData);
                setIsAuthenticated(true);
              } else {
                // If no profile, create one
                const newProfile = await ensureProfileExists(userData.user.id, userData.user);
                setUser(newProfile);
                setIsAuthenticated(true);
              }
            } catch (profileError) {
              console.error("Error handling profile:", profileError);
              // Still authenticate the user even if profile has issues
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            setIsLoading(true);
            const { data: userData } = await supabase.auth.getUser();
            
            if (userData.user) {
              try {
                // First try to fetch profile
                const profileData = await fetchUserProfile(userData.user.id);
                
                if (profileData) {
                  setUser(profileData);
                  setIsAuthenticated(true);
                } else {
                  // If no profile, create one
                  const newProfile = await ensureProfileExists(userData.user.id, userData.user);
                  setUser(newProfile);
                  setIsAuthenticated(true);
                }
              } catch (profileError) {
                console.error("Error handling profile on auth change:", profileError);
                // Still authenticate the user even if profile has issues
                setIsAuthenticated(true);
              }
            }
          } catch (error) {
            console.error("Auth state change error:", error);
          } finally {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
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
      setIsLoading(true);
      
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
        try {
          // Fetch profile after login
          const profileData = await fetchUserProfile(data.user.id);
          
          if (profileData) {
            setUser(profileData);
            setIsAuthenticated(true);
            
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
          } else {
            // Create profile if doesn't exist
            const newProfile = await ensureProfileExists(data.user.id, data.user);
            setUser(newProfile);
            setIsAuthenticated(true);
            
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
          }
        } catch (profileError) {
          console.error("Error handling profile during login:", profileError);
          // Still authenticate the user even if profile has issues
          setIsAuthenticated(true);
          
          toast({
            title: "Login successful",
            description: "Welcome back! (Note: There was an issue with your profile data)",
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
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function using Supabase
  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
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
          try {
            // Create the profile immediately
            const newProfile = await ensureProfileExists(data.user.id, {
              ...data.user,
              name: name // Make sure name is passed
            });
            
            setUser(newProfile);
            setIsAuthenticated(true);
            
            toast({
              title: "Account created successfully",
              description: "Welcome to Viralize!",
            });
          } catch (profileError) {
            console.error("Error creating profile during signup:", profileError);
            // Still authenticate the user even if profile creation fails
            setIsAuthenticated(true);
            
            toast({
              title: "Account created with warning",
              description: "Welcome to Viralize! (Note: There was an issue setting up your profile)",
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
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function using Supabase
  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
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
      ensureProfileExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};
