import { ReviewQuality } from '../types/card';

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

const ratingColors: Record<ReviewQuality, string> = {
  0: '#dc3545', // red
  1: '#fd7e14', // orange
  2: '#ffc107', // yellow
  3: '#28a745', // green
  4: '#20c997', // teal
  5: '#17a2b8', // cyan
};

export function RatingButtons({ onRate }: RatingButtonsProps) {
  const ratings: ReviewQuality[] = [0, 1, 2, 3, 4, 5];

  return (
    <div>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <strong>How well did you remember this?</strong>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {ratings.map((rating) => (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: ratingColors[rating],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              minWidth: '100px',
            }}
          >
            {rating}: {ratingLabels[rating]}
          </button>
        ))}
      </div>
    </div>
  );
}

