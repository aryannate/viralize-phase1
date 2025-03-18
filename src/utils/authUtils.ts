
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// A simple users store in localStorage
const USERS_STORAGE_KEY = "app_users";
const CURRENT_USER_KEY = "current_user";

// Helper to get all users from localStorage
const getUsers = (): Record<string, User> => {
  const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJSON ? JSON.parse(usersJSON) : {};
};

// Helper to save users to localStorage
const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const ensureProfileExists = async (userId: string, userData: any): Promise<User> => {
  try {
    // First try to get the profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (profile) {
      return profile as User;
    }

    // If no profile in Supabase, check local storage as fallback
    const users = getUsers();
    if (users[userId]) {
      return users[userId];
    }
    
    const name = userData?.name || "User";
    const email = userData?.email || "";
    
    const newProfile: User = {
      id: userId,
      name,
      email,
    };
    
    // Create profile in Supabase if possible
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile]);

    if (insertError) {
      console.warn("Failed to create profile in Supabase, using local storage:", insertError);
      // Fallback to localStorage
      users[userId] = newProfile;
      saveUsers(users);
    }
    
    return newProfile;
  } catch (error) {
    console.error("Error ensuring profile exists:", error);
    // Fallback to local storage on any error
    const users = getUsers();
    if (users[userId]) {
      return users[userId];
    }
    
    const name = userData?.name || "User";
    const email = userData?.email || "";
    
    const newProfile: User = {
      id: userId,
      name,
      email,
    };
    
    users[userId] = newProfile;
    saveUsers(users);
    
    return newProfile;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    if (!userId) throw new Error("No user ID provided");
    
    // Try to update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) throw error;
    
    // Also update in localStorage as fallback
    const users = getUsers();
    if (!users[userId]) throw new Error("User not found");
    
    users[userId] = { ...users[userId], ...data };
    saveUsers(users);
    
  } catch (error: any) {
    console.error("Error updating profile in Supabase, using local storage only:", error);
    
    // Fallback to localStorage
    const users = getUsers();
    if (!users[userId]) throw new Error("User not found");
    
    users[userId] = { ...users[userId], ...data };
    saveUsers(users);
    
    toast({
      title: "Update failed in cloud",
      description: "Your profile was updated locally but not synced to the cloud.",
      variant: "destructive",
    });
  }
};

export const resendEmailConfirmation = async (email: string): Promise<void> => {
  try {
    // Try to resend confirmation with Supabase
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) throw error;
    
    toast({
      title: "Confirmation sent",
      description: "Please check your email for the confirmation link.",
    });
  } catch (error: any) {
    console.error("Error resending confirmation:", error);
    
    // Fallback message for local storage auth
    toast({
      title: "Email confirmation",
      description: "Email confirmation is not required in this system.",
    });
  }
};
