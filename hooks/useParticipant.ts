import { useState, useEffect } from 'react';

/**
 * Hook to manage participant state and localStorage persistence
 */
export function useParticipant(sessionId: string) {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const savedParticipantId = localStorage.getItem(`session_${sessionId}_participant`);
    const savedNickname = localStorage.getItem(`session_${sessionId}_nickname`);

    if (savedParticipantId && savedNickname) {
      setParticipantId(savedParticipantId);
      setNickname(savedNickname);
      setHasJoined(true);
    }
  }, [sessionId]);

  const saveParticipant = (id: string, name: string) => {
    setParticipantId(id);
    setNickname(name);
    localStorage.setItem(`session_${sessionId}_participant`, id);
    localStorage.setItem(`session_${sessionId}_nickname`, name);
    setHasJoined(true);
  };

  return {
    participantId,
    nickname,
    hasJoined,
    setNickname,
    saveParticipant,
  };
}
