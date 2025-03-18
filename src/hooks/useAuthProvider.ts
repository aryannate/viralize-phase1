
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { 
  ensureProfileExists, 
  updateUserProfile
} from "@/utils/authUtils";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

// Constants for localStorage keys
const CURRENT_USER_KEY = "current_user";
const USERS_STORAGE_KEY = "app_users";

// Helper to get all users from localStorage
const getUsers = (): Record<string, User> => {
  const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJSON ? JSON.parse(usersJSON) : {};
};

// Helper to save users to localStorage
const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session on initial load
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // First try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          const profile = await ensureProfileExists(session.user.id, {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
          });
          
          setUser(profile);
          setIsAuthenticated(true);
        } else if (error) {
          console.warn("Supabase session error, checking local storage:", error);
          // Try localStorage as fallback
          const currentUserJSON = localStorage.getItem(CURRENT_USER_KEY);
          if (currentUserJSON) {
            const userData = JSON.parse(currentUserJSON);
            const profile = await ensureProfileExists(userData.id, userData);
            setUser(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await ensureProfileExists(session.user.id, {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        });
        
        setUser(profile);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try Supabase login first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.warn("Supabase login failed, trying local storage:", error);
        // Try local storage as fallback
        const users = getUsers();
        
        // Find user with matching email
        const userEntry = Object.entries(users).find(([_, user]) => user.email === email);
        
        if (!userEntry || userEntry[1]._password !== password) {
          throw new Error("Invalid email or password");
        }
        
        const userId = userEntry[0];
        const userData = userEntry[1];
        
        // Set current user in localStorage
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        
        const profile = await ensureProfileExists(userId, userData);
        setUser(profile);
        setIsAuthenticated(true);
      } else if (data.user) {
        // Supabase login succeeded
        const profile = await ensureProfileExists(data.user.id, {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
        });
        
        setUser(profile);
        setIsAuthenticated(true);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try Supabase signup first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        }
      });
      
      if (error) {
        console.warn("Supabase signup failed, using local storage:", error);
        // Fall back to local storage
        const users = getUsers();
        
        // Check if email already exists
        const userExists = Object.values(users).some(user => user.email === email);
        if (userExists) {
          throw new Error("Email already in use");
        }
        
        // Create new user
        const userId = uuidv4();
        const newUser: User = {
          id: userId,
          name,
          email,
          _password: password, // Store password (in a real app, hash this!)
        };
        
        // Save user to "database"
        users[userId] = newUser;
        saveUsers(users);
      }
      
      toast({
        title: "Signup successful",
        description: "You can now log in with your new account.",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error("No user logged in");
      await updateUserProfile(user.id, data);
      
      // Update current user in localStorage
      if (user) {
        const updatedUser = { ...user, ...data };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
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
    try {
      setIsLoading(true);
      
      // Try Supabase logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn("Supabase logout error, proceeding with local logout:", error);
      }
      
      // Remove current user from localStorage
      localStorage.removeItem(CURRENT_USER_KEY);
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      toast({
        title: "Confirmation email sent",
        description: "Please check your email for the confirmation link.",
      });
    } catch (error) {
      console.error("Failed to resend confirmation email:", error);
      
      toast({
        title: "Email confirmation",
        description: "Email confirmation is not required in this system.",
      });
    }
  };

  // For compatibility with existing code
  const autoLogin = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      throw new Error("Auto login failed. Please use regular login.");
    }
    
    const profile = await ensureProfileExists(data.session.user.id, {
      id: data.session.user.id,
      email: data.session.user.email,
      name: data.session.user.user_metadata?.name || 'User'
    });
    
    setUser(profile);
    setIsAuthenticated(true);
    
    return profile;
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
