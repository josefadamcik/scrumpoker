import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Participant } from '@/lib/types';

interface ParticipantsListProps {
  participants: Participant[];
  revealed: boolean;
  votedCount: number;
  totalCount: number;
  connectedParticipants: Set<string>;
}

export function ParticipantsList({
  participants,
  revealed,
  votedCount,
  totalCount,
  connectedParticipants
}: ParticipantsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Participants ({votedCount}/{totalCount} voted)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((participant) => {
            const isConnected = connectedParticipants.has(participant.id);

            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isConnected
                    ? 'bg-gray-50 dark:bg-gray-700'
                    : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={isConnected ? 'Online' : 'Offline'}
                  />
                  <span className={`font-medium ${
                    isConnected
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {participant.nickname}
                  </span>
                </div>
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
