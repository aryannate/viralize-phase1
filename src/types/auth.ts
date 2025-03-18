
export type User = {
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
  _password?: string; // Added for authentication
};

export type AuthContextType = {
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
