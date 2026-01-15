import { QuizResult } from './Quiz';
import './components.css';

interface QuizSummaryProps {
  result: QuizResult;
  onReadAgain: () => void;
  onNextTopic: () => void;
  canGoToNext: boolean; // Whether there is a next topic available
}

export function QuizSummary({ result, onReadAgain, onNextTopic, canGoToNext }: QuizSummaryProps) {
  return (
    <div className="quiz-summary-container">
      <div className="quiz-summary-card">
        <h2 className="quiz-summary-title">
          Quiz Complete!
        </h2>
        
        <div className="quiz-summary-score-section">
          <div className={`quiz-summary-score ${result.score >= 80 ? 'quiz-summary-score-high' : 'quiz-summary-score-low'}`}>
            {result.score}%
          </div>
          <div className="quiz-summary-result-text">
            You answered {result.correctCards} out of {result.totalCards} cards correctly
          </div>
          {result.score < 80 && (
            <div className="quiz-summary-warning">
              💡 Consider reading the topic again to improve your understanding
            </div>
          )}
        </div>

        <div className="quiz-summary-actions">
          <button
            onClick={onReadAgain}
            className="quiz-summary-button quiz-summary-button-secondary"
          >
            Read Again
          </button>
          <button
            onClick={onNextTopic}
            disabled={!canGoToNext}
            className={`quiz-summary-button quiz-summary-button-primary ${!canGoToNext ? 'quiz-summary-button-disabled' : ''}`}
          >
            Next Topic →
          </button>
        </div>
      </div>
    </div>
  );
}

