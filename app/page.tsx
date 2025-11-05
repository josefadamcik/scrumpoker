'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createSession() {
    setLoading(true);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      // Store creator ID in localStorage
      localStorage.setItem(`session_${data.sessionId}_creator`, data.creatorId);
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🃏 Scrum Poker
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Simple planning poker for agile teams
            </p>
          </div>

          <button
            onClick={createSession}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? 'Creating Session...' : 'Create New Session'}
          </button>

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
        </div>
      </div>
    </div>
  );
}
