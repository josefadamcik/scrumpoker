import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import type { Session } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to manage Supabase real-time subscriptions
 */
export function useRealtime(
  sessionId: string,
  enabled: boolean,
  onUpdate: (session: Session) => void
) {
  useEffect(() => {
    if (!enabled) return;

    console.log('🔌 Setting up real-time subscription for session:', sessionId);

    const channel: RealtimeChannel = supabaseClient
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('🔥 Real-time update received:', payload);

          const updated = payload.new as any;
          if (updated) {
            onUpdate({
              id: updated.id,
              createdAt: new Date(updated.created_at).getTime(),
              participants: updated.participants,
              revealed: updated.revealed,
              creatorId: updated.creator_id,
              voteHistory: updated.vote_history,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up subscription');
      supabaseClient.removeChannel(channel);
    };
  }, [sessionId, enabled, onUpdate]);
}
