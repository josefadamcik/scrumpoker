import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SessionHeaderProps {
  nickname: string;
  isCreator: boolean;
}

export function SessionHeader({ nickname, isCreator }: SessionHeaderProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Planning Poker Session
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Logged in as <span className="font-semibold">{nickname}</span>
            {isCreator && (
              <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                Creator
              </span>
            )}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={copyLink}>
          {copiedLink ? '✓ Copied!' : '📋 Copy Link'}
        </Button>
      </div>
    </Card>
  );
}
