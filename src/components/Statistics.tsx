import { CollectionStatistics } from '../utils/statistics';
import './components.css';

interface StatisticsProps {
  stats: CollectionStatistics;
}

export function Statistics({ stats }: StatisticsProps) {
  return (
    <div className="statistics-grid">
      <div className="stat-box stat-box-gray">
        <div className="stat-label">Total Cards</div>
        <div className="stat-value">{stats.totalCards}</div>
      </div>

      <div className="stat-box stat-box-yellow">
        <div className="stat-label">Due Now</div>
        <div className="stat-value stat-value-danger">
          {stats.dueCount}
        </div>
      </div>

      <div className="stat-box stat-box-blue">
        <div className="stat-label">New</div>
        <div className="stat-value">{stats.newCount}</div>
      </div>

      <div className="stat-box stat-box-yellow">
        <div className="stat-label">Learning</div>
        <div className="stat-value">{stats.learningCount}</div>
      </div>

      <div className="stat-box stat-box-light-blue">
        <div className="stat-label">Review</div>
        <div className="stat-value">{stats.reviewCount}</div>
      </div>

      <div className="stat-box stat-box-green">
        <div className="stat-label">Mastered</div>
        <div className="stat-value">{stats.masteredCount}</div>
      </div>

      <div className="stat-box stat-box-gray">
        <div className="stat-label">Avg Stability</div>
        <div className="stat-value">
          {stats.averageStability.toFixed(1)}d
        </div>
      </div>

      <div className="stat-box stat-box-gray">
        <div className="stat-label">Retention Rate</div>
        <div className="stat-value">
          {stats.retentionRate.toFixed(1)}%
        </div>
      </div>

      <div className="stat-box stat-box-gray">
        <div className="stat-label">Total Reviews</div>
        <div className="stat-value">{stats.totalReviews}</div>
      </div>
    </div>
  );
}

