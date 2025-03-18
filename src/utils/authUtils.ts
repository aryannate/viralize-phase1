
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";

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
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    if (!userId) throw new Error("No user ID provided");
    
    const users = getUsers();
    if (!users[userId]) throw new Error("User not found");
    
    users[userId] = { ...users[userId], ...data };
    saveUsers(users);
    
  } catch (error: any) {
    toast({
      title: "Update failed",
      description: error.message || "There was an error updating your profile.",
      variant: "destructive",
    });
    throw error;
  }
};

export const resendEmailConfirmation = async (email: string): Promise<void> => {
  // No-op function since we're not using email confirmation
  toast({
    title: "Email confirmation",
    description: "Email confirmation is not required in this system.",
  });
};
