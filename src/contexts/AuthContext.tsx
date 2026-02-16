import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { sendWelcomeEmail, sendEmailVerification } from '../lib/emailService';

interface Profile {
  id: string;
  user_id: string;
  user_type: 'consumer' | 'creator';
  role?: 'consumer' | 'creator' | 'admin';
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: 'dating' | 'content_creator' | 'escort' | 'ladyboy' | 'massage' | null;
  city?: string | null;
  suspended?: boolean;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  height?: string | null;
  build?: string | null;
  hair_colour?: string | null;
  eye_colour?: string | null;
  smoke?: boolean | null;
  date_of_birth?: string | null;
  age_verified?: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  tier: 'none' | 'standard' | 'vip';
  status: 'active' | 'canceled' | 'expired';
  expiry_date: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'consumer' | 'creator', dateOfBirth?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  const fetchSubscription = async (userId: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      const subscriptionData = await fetchSubscription(user.id);
      setSubscription(subscriptionData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const [profileData, subscriptionData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchSubscription(session.user.id),
          ]);
          setProfile(profileData);
          setSubscription(subscriptionData);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          setUser(session?.user ?? null);
          if (session?.user) {
            const [profileData, subscriptionData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchSubscription(session.user.id),
            ]);
            setProfile(profileData);
            setSubscription(subscriptionData);
          } else {
            setProfile(null);
            setSubscription(null);
          }
          setLoading(false);
        })();
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userType: 'consumer' | 'creator', dateOfBirth?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from signup');

    const profileData: any = {
      user_id: data.user.id,
      user_type: userType,
      role: userType,
    };

    if (dateOfBirth && userType === 'creator') {
      profileData.date_of_birth = dateOfBirth;
    }

    await supabase.from('profiles').insert(profileData);

    await supabase.from('subscriptions').insert({
      user_id: data.user.id,
      tier: 'none',
      status: 'active',
    });

    const [fetchedProfile, subscriptionData] = await Promise.all([
      fetchProfile(data.user.id),
      fetchSubscription(data.user.id),
    ]);

    setProfile(fetchedProfile);
    setSubscription(subscriptionData);

    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase.from('email_verifications').insert({
      user_id: data.user.id,
      email: email,
      token: verificationToken,
      expires_at: expiresAt.toISOString(),
    });

    sendEmailVerification(email, email.split('@')[0], verificationToken).catch(err =>
      console.error('Failed to send verification email:', err)
    );

    sendWelcomeEmail(email, email.split('@')[0]).catch(err =>
      console.error('Failed to send welcome email:', err)
    );
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const [profileData, subscriptionData] = await Promise.all([
        fetchProfile(data.user.id),
        fetchSubscription(data.user.id),
      ]);

      if (profileData?.suspended) {
        await supabase.auth.signOut();
        throw new Error(`Account suspended: ${profileData.suspended_reason || 'No reason provided'}`);
      }

      setProfile(profileData);
      setSubscription(subscriptionData);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    subscription,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
