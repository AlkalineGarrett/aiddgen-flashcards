interface StudySession {
  startTime: number;
  cardsReviewed: number;
  timeSpent: number; // in seconds
}

interface StudyStatsProps {
  session: StudySession;
}

export function StudyStats({ session }: StudyStatsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        fontSize: '0.875rem',
        color: '#666',
      }}
    >
      <span>
        <strong>Cards:</strong> {session.cardsReviewed}
      </span>
      <span>
        <strong>Time:</strong> {formatTime(session.timeSpent)}
      </span>
      {session.cardsReviewed > 0 && (
        <span>
          <strong>Avg:</strong> {formatTime(Math.floor(session.timeSpent / session.cardsReviewed))} per card
        </span>
      )}
    </div>
  );
}

