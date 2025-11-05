import { useState, useCallback } from 'react';
import type { Card } from '@/lib/types';

interface UseSessionActionsProps {
  sessionId: string;
  participantId: string | null;
  onSuccess?: () => void;
}

/**
 * Hook to manage session actions (join, vote, reveal, reset)
 */
export function useSessionActions({ sessionId, participantId, onSuccess }: UseSessionActionsProps) {
  const [joining, setJoining] = useState(false);

  const joinSession = useCallback(async (nickname: string) => {
    setJoining(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to join session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
      throw error;
    } finally {
      setJoining(false);
    }
  }, [sessionId]);

  const submitVote = useCallback(async (vote: Card | null) => {
    if (!participantId) return;

    try {
      const response = await fetch(`/api/session/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, vote }),
      });

      if (response.ok && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }, [sessionId, participantId, onSuccess]);

  const revealVotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/reveal`, {
        method: 'POST',
      });

      if (response.ok && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error revealing votes:', error);
    }
  }, [sessionId, onSuccess]);

  const resetVotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/reset`, {
        method: 'POST',
      });

      if (response.ok && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error resetting votes:', error);
    }
  }, [sessionId, onSuccess]);

  return {
    joining,
    joinSession,
    submitVote,
    revealVotes,
    resetVotes,
  };
}
