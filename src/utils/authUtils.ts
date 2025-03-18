
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";

export const ensureProfileExists = async (userId: string, userData: any): Promise<User> => {
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

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    if (!userId) throw new Error("No user ID provided");
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
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
