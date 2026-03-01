import { createClient, User, SupabaseClient } from '@supabase/supabase-js';
import { setUser, clearUser, addBreadcrumb, captureException } from './ObservabilityService';
import { identifyUser, resetUser as resetAnalyticsUser, trackAuthSignIn, trackAuthSignOut } from './AnalyticsService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

let supabase: SupabaseClient | null = null;
if (isConfigured) {
  supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export interface GlobalLeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  score: number;
  level: number;
  avatar_url?: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}

class AuthServiceImpl {
  private currentUser: AuthUser | null = null;
  private onAuthChangeCallback?: (user: AuthUser | null) => void;

  constructor() {
    if (supabase) {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = this.mapUser(session.user);
          setUser(this.currentUser.id, this.currentUser.name);
          identifyUser(this.currentUser.id, { name: this.currentUser.name });
          const provider = session.user.app_metadata?.provider || (session.user.is_anonymous ? 'guest' : 'unknown');
          trackAuthSignIn(provider === 'email' ? 'google' : provider === 'facebook' ? 'facebook' : 'guest');
          addBreadcrumb('auth', 'User signed in', { method: provider });
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          clearUser();
          resetAnalyticsUser();
          trackAuthSignOut();
          addBreadcrumb('auth', 'User signed out');
        }
        if (this.onAuthChangeCallback) {
          this.onAuthChangeCallback(this.currentUser);
        }
      });
    }
  }

  isConfigured(): boolean {
    return isConfigured;
  }

  private mapUser(user: User): AuthUser {
    const metadata = user.user_metadata || {};
    const isAnonymous = user.is_anonymous;
    
    let name: string;
    if (isAnonymous) {
      name = metadata.guest_name || `Guest_${user.id.substring(0, 6)}`;
    } else {
      name = metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Player';
    }
    
    return {
      id: user.id,
      email: user.email,
      name,
      avatar: metadata.avatar_url || metadata.picture,
    };
  }

  onAuthChange(callback: (user: AuthUser | null) => void) {
    this.onAuthChangeCallback = callback;
  }

  async initialize(): Promise<AuthUser | null> {
    if (!supabase) return null;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!error) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.currentUser = this.mapUser(session.user);
      return this.currentUser;
    }
    this.currentUser = null;
    return null;
  }

  getUser(): AuthUser | null {
    return this.currentUser;
  }

  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    addBreadcrumb('auth', 'Attempting Google sign in');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        captureException(new Error(error.message), { provider: 'google' });
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      captureException(err as Error, { provider: 'google' });
      return { success: false, error: String(err) };
    }
  }

  async signInWithFacebook(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    addBreadcrumb('auth', 'Attempting Facebook sign in');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        captureException(new Error(error.message), { provider: 'facebook' });
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      captureException(err as Error, { provider: 'facebook' });
      return { success: false, error: String(err) };
    }
  }

  async signInAnonymously(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.signOut();
        this.currentUser = null;
      }

      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        this.currentUser = this.mapUser(data.user);
        if (this.onAuthChangeCallback) {
          this.onAuthChangeCallback(this.currentUser);
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut({ scope: 'global' });
    this.currentUser = null;
  }

  async submitScore(score: number, level: number): Promise<{ rank: number; total: number } | null> {
    if (!supabase) return null;
    
    const user = this.getUser();
    if (!user) return null;

    try {
      const { error } = await supabase.from('leaderboard').insert({
        user_id: user.id,
        username: user.name || 'Player',
        avatar_url: user.avatar || null,
        score,
        level,
      });

      if (error) {
        captureException(new Error(error.message), { operation: 'submitScore', score, level });
        return null;
      }

      const { count, data } = await supabase
        .from('leaderboard')
        .select('user_id', { count: 'exact', head: false })
        .order('score', { ascending: false });

      if (!data) return null;

      let rank = 1;
      for (let i = 0; i < data.length; i++) {
        if (data[i].user_id === user.id) {
          const sameScore = data.filter((d, idx) => idx < i && d.user_id === user.id);
          if (sameScore.length > 0) {
            rank = i - sameScore.length + 1;
          } else {
            rank = i + 1;
          }
          break;
        }
        rank++;
      }

      return { rank, total: count || data.length };
    } catch (err) {
      captureException(err as Error, { operation: 'submitScore', score, level });
      return null;
    }
  }

  async getLeaderboard(limit = 20): Promise<GlobalLeaderboardEntry[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        captureException(new Error(error.message), { operation: 'getLeaderboard' });
        return [];
      }

      return data || [];
    } catch (err) {
      captureException(err as Error, { operation: 'getLeaderboard' });
      return [];
    }
  }
}

export const authService = new AuthServiceImpl();
