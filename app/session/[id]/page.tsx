'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, Participant, Card } from '@/lib/types';
import { CARDS } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SessionPage({ params }: Props) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if user is the creator
  const isCreator = session?.creatorId === participantId;

  // Fetch session data
  async function fetchSession() {
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
  }

  // Join session
  async function joinSession(e: React.FormEvent) {
    e.preventDefault();
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
      setParticipantId(data.participantId);
      setNickname(data.nickname);
      localStorage.setItem(`session_${sessionId}_participant`, data.participantId);
      localStorage.setItem(`session_${sessionId}_nickname`, data.nickname);
      setHasJoined(true);
      fetchSession();
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    } finally {
      setJoining(false);
    }
  }

  // Submit vote
  async function submitVote(vote: Card | null) {
    if (!participantId) return;

    try {
      const response = await fetch(`/api/session/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, vote }),
      });

      if (response.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }

  // Reveal votes
  async function revealVotes() {
    try {
      const response = await fetch(`/api/session/${sessionId}/reveal`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error('Error revealing votes:', error);
    }
  }

  // Reset votes
  async function resetVotes() {
    try {
      const response = await fetch(`/api/session/${sessionId}/reset`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error('Error resetting votes:', error);
    }
  }

  // Copy link
  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  // Initialize
  useEffect(() => {
    // Check if user already joined this session
    const savedParticipantId = localStorage.getItem(`session_${sessionId}_participant`);
    const savedNickname = localStorage.getItem(`session_${sessionId}_nickname`);

    if (savedParticipantId && savedNickname) {
      // User has joined before (either as creator or regular participant)
      setParticipantId(savedParticipantId);
      setNickname(savedNickname);
      setHasJoined(true);
    }

    fetchSession();
  }, [sessionId]);

  // Poll for updates
  useEffect(() => {
    if (!hasJoined) return;

    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [hasJoined, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Join Session
            </h1>
            <form onSubmit={joinSession} className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose a nickname (or leave blank for random)
                </label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g., John Doe"
                  maxLength={30}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={joining}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {joining ? 'Joining...' : 'Join Session'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-lg text-gray-600 dark:text-gray-300">Session not found</div>
      </div>
    );
  }

  const participants = Object.values(session.participants);
  const currentParticipant = participantId ? session.participants[participantId] : null;
  const votedCount = participants.filter(p => p.vote !== null).length;
  const totalCount = participants.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Planning Poker Session
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Logged in as <span className="font-semibold">{currentParticipant?.nickname}</span>
                {isCreator && <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">Creator</span>}
              </p>
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
            >
              {copiedLink ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Participants */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Participants ({votedCount}/{totalCount} voted)
              </h2>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {participant.nickname}
                    </span>
                    {participant.vote !== null ? (
                      session.revealed ? (
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {participant.vote}
                        </span>
                      ) : (
                        <span className="text-green-500">✓</span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Voting Area */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {session.revealed ? 'Votes Revealed' : 'Pick Your Card'}
              </h2>

              {/* Cards */}
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-3 mb-6">
                {CARDS.map((card) => {
                  const isSelected = currentParticipant?.vote === card;
                  return (
                    <button
                      key={card}
                      onClick={() => submitVote(card)}
                      disabled={session.revealed}
                      className={`aspect-[3/4] rounded-xl border-2 font-bold text-2xl transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg scale-105'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-indigo-400 hover:scale-105'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {card}
                    </button>
                  );
                })}
              </div>

              {/* Clear Vote */}
              {currentParticipant?.vote && !session.revealed && (
                <button
                  onClick={() => submitVote(null)}
                  className="w-full mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Clear Vote
                </button>
              )}

              {/* Control Buttons (Creator Only) */}
              {isCreator && (
                <div className="flex gap-3">
                  <button
                    onClick={revealVotes}
                    disabled={session.revealed || votedCount === 0}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    Reveal Votes
                  </button>
                  <button
                    onClick={resetVotes}
                    className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Reset Round
                  </button>
                </div>
              )}

              {/* Stats (when revealed) */}
              {session.revealed && votedCount > 0 && (
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Results</h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {(() => {
                      const numericVotes = participants
                        .map(p => p.vote)
                        .filter(v => v && !isNaN(Number(v)))
                        .map(Number);

                      if (numericVotes.length > 0) {
                        const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
                        const min = Math.min(...numericVotes);
                        const max = Math.max(...numericVotes);
                        return (
                          <>
                            <div>Average: <span className="font-bold">{avg.toFixed(1)}</span></div>
                            <div>Range: <span className="font-bold">{min} - {max}</span></div>
                          </>
                        );
                      }
                      return <div>No numeric votes to analyze</div>;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
