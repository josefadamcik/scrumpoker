import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VotingCard } from './VotingCard';
import { CARDS, type Card as CardType } from '@/lib/types';

interface VotingAreaProps {
  revealed: boolean;
  currentVote: CardType | null;
  onVote: (card: CardType | null) => void;
}

export function VotingArea({ revealed, currentVote, onVote }: VotingAreaProps) {
  const [pendingVote, setPendingVote] = useState<CardType | null>(null);

  // Clear pending state when server confirms the vote
  useEffect(() => {
    if (currentVote === pendingVote) {
      setPendingVote(null);
    }
  }, [currentVote, pendingVote]);

  const handleVote = (card: CardType | null) => {
    setPendingVote(card);
    onVote(card);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{revealed ? 'Votes Revealed' : 'Pick Your Card'}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Cards Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3 mb-6">
          {CARDS.map((card) => (
            <VotingCard
              key={card}
              card={card}
              isSelected={currentVote === card}
              isPending={pendingVote === card && currentVote !== card}
              disabled={revealed}
              onSelect={() => handleVote(card)}
            />
          ))}
        </div>

        {/* Clear Vote Button */}
        {currentVote && !revealed && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleVote(null)}
          >
            Clear Vote
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
