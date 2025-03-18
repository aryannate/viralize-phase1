
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { 
  ensureProfileExists, 
  updateUserProfile
} from "@/utils/authUtils";
import { v4 as uuidv4 } from "uuid";

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
        const currentUserJSON = localStorage.getItem(CURRENT_USER_KEY);
        if (currentUserJSON) {
          const userData = JSON.parse(currentUserJSON);
          const profile = await ensureProfileExists(userData.id, userData);
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Get all users
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
      
      // Get all users
      const users = getUsers();
      
      // Check if email already exists
      const userExists = Object.values(users).some(user => user.email === email);
      if (userExists) {
        throw new Error("Email already in use");
      }
      
      // Create new user
      const userId = uuidv4();
      const newUser: User & { _password: string } = {
        id: userId,
        name,
        email,
        _password: password, // Store password (in a real app, hash this!)
      };
      
      // Save user to "database"
      users[userId] = newUser;
      saveUsers(users);
      
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
    // No-op function since we're not using email confirmation
    toast({
      title: "Email confirmation",
      description: "Email confirmation is not required in this system.",
    });
  };

  // For compatibility with existing code
  const autoLogin = async () => {
    throw new Error("Auto login is disabled. Please use regular login.");
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
