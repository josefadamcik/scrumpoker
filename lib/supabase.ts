import { createClient } from '@supabase/supabase-js';
import type { Session, Participant } from './types';

// Supabase client for server-side use (API routes)
// Uses service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface SessionRow {
  id: string;
  created_at: string;
  participants: Record<string, Participant>;
  revealed: boolean;
  creator_id: string;
  expires_at: string;
  vote_history?: any;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Convert database row to Session type
    return {
      id: data.id,
      createdAt: new Date(data.created_at).getTime(),
      participants: data.participants,
      revealed: data.revealed,
      creatorId: data.creator_id,
      voteHistory: data.vote_history,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(sessionId: string, session: Session): Promise<void> {
  try {
    const expiresAt = new Date(session.createdAt + 24 * 60 * 60 * 1000).toISOString();

    const sessionRow: SessionRow = {
      id: session.id,
      created_at: new Date(session.createdAt).toISOString(),
      participants: session.participants,
      revealed: session.revealed,
      creator_id: session.creatorId,
      expires_at: expiresAt,
      vote_history: session.voteHistory,
    };

    const { error } = await supabase
      .from('sessions')
      .upsert(sessionRow);

    if (error) throw error;
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}
