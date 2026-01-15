interface StudySession {
  startTime: number;
  cardsReviewed: number;
  timeSpent: number; // in seconds
}

import './components.css';

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
    <div className="study-stats-container">
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

