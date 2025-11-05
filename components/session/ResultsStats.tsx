import type { Participant } from '@/lib/types';

interface ResultsStatsProps {
  participants: Participant[];
}

export function ResultsStats({ participants }: ResultsStatsProps) {
  const numericVotes = participants
    .map((p) => p.vote)
    .filter((v) => v && !isNaN(Number(v)))
    .map(Number);

  if (numericVotes.length === 0) {
    return (
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Results</h3>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          No numeric votes to analyze
        </div>
      </div>
    );
  }

  const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);

  return (
    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Results</h3>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <div>
          Average: <span className="font-bold">{avg.toFixed(1)}</span>
        </div>
        <div>
          Range: <span className="font-bold">{min} - {max}</span>
        </div>
      </div>
    </div>
  );
}
