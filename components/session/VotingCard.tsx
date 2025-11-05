import { cn } from '@/lib/cn';
import type { Card } from '@/lib/types';

interface VotingCardProps {
  card: Card;
  isSelected: boolean;
  isPending: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export function VotingCard({ card, isSelected, isPending, disabled, onSelect }: VotingCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'aspect-[3/4] rounded-xl border-2 font-bold text-2xl transition-all',
        isSelected
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg scale-105'
          : isPending
          ? 'border-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 shadow-md scale-105 animate-pulse'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-indigo-400 hover:scale-105',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {card}
    </button>
  );
}
