import type { RoundHistory } from '@/lib/types';

interface VoteHistoryProps {
  history: RoundHistory[];
}

export function VoteHistory({ history }: VoteHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }

  // Display in reverse order (newest first)
  const sortedHistory = [...history].reverse();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Vote History
      </h2>
      <div className="space-y-4">
        {sortedHistory.map((round) => {
          const numericVotes = round.votes
            .map((v) => v.vote)
            .filter((v) => v && !isNaN(Number(v)))
            .map(Number);

          const avg =
            numericVotes.length > 0
              ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
              : null;

          return (
            <div
              key={round.roundNumber}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Round {round.roundNumber}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(round.revealedAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {round.votes.map((voteRecord) => (
                  <div
                    key={voteRecord.participantId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {voteRecord.nickname}
                    </span>
                    <span className="font-mono font-semibold px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 rounded">
                      {voteRecord.vote}
                    </span>
                  </div>
                ))}
              </div>

              {avg !== null && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average: <span className="font-bold">{avg.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
