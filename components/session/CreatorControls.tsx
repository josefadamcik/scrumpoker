import { Button } from '@/components/ui/Button';

interface CreatorControlsProps {
  revealed: boolean;
  votedCount: number;
  onReveal: () => void;
  onReset: () => void;
}

export function CreatorControls({ revealed, votedCount, onReveal, onReset }: CreatorControlsProps) {
  return (
    <div className="flex gap-3 mt-4">
      <Button
        variant="success"
        className="flex-1"
        onClick={onReveal}
        disabled={revealed || votedCount === 0}
      >
        Reveal Votes
      </Button>
      <Button
        variant="danger"
        className="flex-1"
        onClick={onReset}
      >
        Reset Round
      </Button>
    </div>
  );
}
