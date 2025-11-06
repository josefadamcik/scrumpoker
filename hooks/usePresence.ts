import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  [userId: string]: {
    participantId: string;
    nickname: string;
    onlineAt: string;
  }[];
}

/**
 * Hook to track participant presence (who is currently connected)
 */
export function usePresence(
  sessionId: string,
  participantId: string | null,
  nickname: string,
  enabled: boolean
) {
  const [connectedParticipants, setConnectedParticipants] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !participantId) return;

    console.log('👥 Setting up presence tracking for session:', sessionId);

    const channel: RealtimeChannel = supabaseClient.channel(`presence:${sessionId}`, {
      config: {
        presence: {
          key: participantId,
        },
      },
    });

    // Track current presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as PresenceState;
        const connected = new Set<string>();

        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            connected.add(presence.participantId);
          });
        });

        console.log('👥 Presence synced, connected participants:', Array.from(connected));
        setConnectedParticipants(connected);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 Participant joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 Participant left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Presence subscription status:', status);

        if (status === 'SUBSCRIBED') {
          // Track our own presence
          await channel.track({
            participantId,
            nickname,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      console.log('👥 Cleaning up presence tracking');
      supabaseClient.removeChannel(channel);
    };
  }, [sessionId, participantId, nickname, enabled]);

  return { connectedParticipants };
}
