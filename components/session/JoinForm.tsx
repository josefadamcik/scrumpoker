import { FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface JoinFormProps {
  nickname: string;
  joining: boolean;
  onNicknameChange: (nickname: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function JoinForm({ nickname, joining, onNicknameChange, onSubmit }: JoinFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Join Session
          </h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Choose a nickname (or leave blank for random)
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value)}
                placeholder="e.g., John Doe"
                maxLength={30}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <Button type="submit" disabled={joining} className="w-full">
              {joining ? 'Joining...' : 'Join Session'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
