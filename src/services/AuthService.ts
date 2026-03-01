import { createClient, User } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xkkombdnhwhwzufdogeo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XrUy1RF5MN3_fVui3fEVtw_nHdYbqSe';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser = this.mapUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }
      if (this.onAuthChangeCallback) {
        this.onAuthChangeCallback(this.currentUser);
      }
    });
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async signInWithFacebook(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async signInAnonymously(): Promise<{ success: boolean; error?: string }> {
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
    await supabase.auth.signOut({ scope: 'global' });
    this.currentUser = null;
  }

  async submitScore(score: number, level: number): Promise<{ rank: number; total: number } | null> {
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
        console.error('Failed to submit score:', error);
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
      console.error('Failed to submit score:', err);
      return null;
    }
  }

  async getLeaderboard(limit = 20): Promise<GlobalLeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      return [];
    }
  }
}

export const authService = new AuthServiceImpl();
