import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@/lib/types';

/**
 * Hook to manage session data fetching and state
 */
export function useSession(sessionId: string) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else if (response.status === 404) {
        alert('Session not found or expired');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  return {
    session,
    setSession,
    loading,
    fetchSession,
  };
}
