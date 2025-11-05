import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Participant } from '@/lib/types';

interface ParticipantsListProps {
  participants: Participant[];
  revealed: boolean;
  votedCount: number;
  totalCount: number;
}

export function ParticipantsList({ participants, revealed, votedCount, totalCount }: ParticipantsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Participants ({votedCount}/{totalCount} voted)
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                revealed ? (
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
      </CardContent>
    </Card>
  );
}
