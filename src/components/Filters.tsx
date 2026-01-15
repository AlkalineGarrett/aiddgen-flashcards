import { CardStatus } from '../utils/cardStatus';
import './components.css';

interface FiltersProps {
  statusFilter: 'all' | CardStatus;
  onStatusChange: (status: 'all' | CardStatus) => void;
  tagFilter: string;
  onTagChange: (tag: string) => void;
  availableTags: string[];
  searchText: string;
  onSearchChange: (text: string) => void;
}

export function Filters({
  statusFilter,
  onStatusChange,
  tagFilter,
  onTagChange,
  availableTags,
  searchText,
  onSearchChange,
}: FiltersProps) {
  return (
    <div className="filters-container">
      <div>
        <label className="filters-search-label">
          Search:
        </label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cards..."
          className="filters-search-input"
        />
      </div>

      <div className="filters-grid">
        <div>
          <label className="filters-field-label">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'all' | CardStatus)}
            className="filters-select"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        <div>
          <label className="filters-field-label">
            Tag:
          </label>
          <select
            value={tagFilter}
            onChange={(e) => onTagChange(e.target.value)}
            className="filters-select"
          >
            <option value="all">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

