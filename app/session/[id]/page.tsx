'use client';

import { use, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useParticipant } from '@/hooks/useParticipant';
import { useRealtime } from '@/hooks/useRealtime';
import { usePresence } from '@/hooks/usePresence';
import { useSessionActions } from '@/hooks/useSessionActions';
import { LoadingState } from '@/components/LoadingState';
import { JoinForm } from '@/components/session/JoinForm';
import { SessionHeader } from '@/components/session/SessionHeader';
import { ParticipantsList } from '@/components/session/ParticipantsList';
import { VotingArea } from '@/components/session/VotingArea';
import { CreatorControls } from '@/components/session/CreatorControls';
import { ResultsStats } from '@/components/session/ResultsStats';
import { VoteHistory } from '@/components/session/VoteHistory';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SessionPage({ params }: Props) {
  const { id: sessionId } = use(params);

  // Custom hooks for state management
  const { session, setSession, loading, fetchSession } = useSession(sessionId);
  const { participantId, nickname, hasJoined, setNickname, saveParticipant } = useParticipant(sessionId);
  const { joining, joinSession, submitVote, revealVotes, resetVotes } = useSessionActions({
    sessionId,
    participantId,
    onSuccess: fetchSession,
  });

  // Set up real-time subscription
  useRealtime(sessionId, hasJoined, setSession);

  // Set up presence tracking
  const { connectedParticipants } = usePresence(sessionId, participantId, nickname, hasJoined);

  // Initial session fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Handle join form submission
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const data = await joinSession(nickname);
    if (data) {
      saveParticipant(data.participantId, data.nickname);
      fetchSession();
    }
  }

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Join form for non-participants
  if (!hasJoined) {
    return (
      <JoinForm
        nickname={nickname}
        joining={joining}
        onNicknameChange={setNickname}
        onSubmit={handleJoin}
      />
    );
  }

  // Session not found
  if (!session) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="text-lg text-gray-600 dark:text-gray-300">Session not found</div>
      </div>
    );
  }

  // Compute derived values
  const participants = Object.values(session.participants);
  const currentParticipant = participantId ? session.participants[participantId] : null;
  const votedCount = participants.filter((p) => p.vote !== null).length;
  const totalCount = participants.length;
  const isCreator = session.creatorId === participantId;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <SessionHeader nickname={currentParticipant?.nickname || ''} isCreator={isCreator} />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Participants Panel */}
          <div className="md:col-span-1">
            <ParticipantsList
              participants={participants}
              revealed={session.revealed}
              votedCount={votedCount}
              totalCount={totalCount}
              connectedParticipants={connectedParticipants}
            />
          </div>

          {/* Voting Panel */}
          <div className="md:col-span-2">
            <VotingArea
              revealed={session.revealed}
              currentVote={currentParticipant?.vote || null}
              onVote={submitVote}
            />

            {/* Creator Controls */}
            {isCreator && (
              <CreatorControls
                revealed={session.revealed}
                votedCount={votedCount}
                onReveal={revealVotes}
                onReset={resetVotes}
              />
            )}

            {/* Results Stats */}
            {session.revealed && votedCount > 0 && (
              <ResultsStats participants={participants} />
            )}

            {/* Vote History */}
            {session.voteHistory && session.voteHistory.length > 0 && (
              <VoteHistory history={session.voteHistory} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
