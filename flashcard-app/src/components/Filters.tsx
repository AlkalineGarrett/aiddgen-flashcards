import { CardStatus } from '../utils/cardStatus';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '1rem',
      }}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Search:
        </label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cards..."
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'all' | CardStatus)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Tag:
          </label>
          <select
            value={tagFilter}
            onChange={(e) => onTagChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
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

