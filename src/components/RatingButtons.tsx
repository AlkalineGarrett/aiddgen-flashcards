import { ReviewQuality } from '../types/card';
import './components.css';

interface RatingButtonsProps {
  onRate: (quality: ReviewQuality) => void;
}

const ratingLabels: Record<ReviewQuality, string> = {
  0: 'Forgot',
  1: 'Hard',
  2: 'Struggled',
  3: 'Good',
  4: 'Easy',
  5: 'Perfect',
};

export function RatingButtons({ onRate }: RatingButtonsProps) {
  const ratings: ReviewQuality[] = [0, 1, 2, 3, 4, 5];

  return (
    <div>
      <div className="rating-buttons-prompt">
        <strong>How well did you remember this?</strong>
      </div>
      <div className="rating-buttons-container">
        {ratings.map((rating) => (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            className={`rating-button rating-button-${rating}`}
          >
            {rating}: {ratingLabels[rating]}
          </button>
        ))}
      </div>
    </div>
  );
}

