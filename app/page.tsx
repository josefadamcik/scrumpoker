'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      // Store creator/participant info in localStorage
      localStorage.setItem(`session_${data.sessionId}_participant`, data.participantId);
      localStorage.setItem(`session_${data.sessionId}_nickname`, data.nickname);
      localStorage.setItem(`session_${data.sessionId}_creator`, data.participantId);
      router.push(`/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🃏 Scrum Poker
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Simple planning poker for agile teams
            </p>
          </div>

          <form onSubmit={createSession} className="space-y-4">
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your nickname (or leave blank for random)
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Session...' : 'Create New Session'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              How it works:
            </h2>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>✓ Create a session and share the link</li>
              <li>✓ Team members pick their cards</li>
              <li>✓ Reveal votes when everyone is ready</li>
              <li>✓ Reset and start a new round</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
