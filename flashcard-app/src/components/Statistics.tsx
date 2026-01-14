import { CollectionStatistics } from '../utils/statistics';

interface StatisticsProps {
  stats: CollectionStatistics;
}

export function Statistics({ stats }: StatisticsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Total Cards
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.totalCards}</div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Due Now
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc3545' }}>
          {stats.dueCount}
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          New
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.newCount}</div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Learning
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.learningCount}</div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#cfe2ff', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Review
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.reviewCount}</div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#d1e7dd', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Mastered
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.masteredCount}</div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Avg Stability
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
          {stats.averageStability.toFixed(1)}d
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Retention Rate
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
          {stats.retentionRate.toFixed(1)}%
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
          Total Reviews
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.totalReviews}</div>
      </div>
    </div>
  );
}

