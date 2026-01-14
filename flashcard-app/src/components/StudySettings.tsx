import { useState, useEffect } from 'react';
import {
  loadQueueConfig,
  saveQueueConfig,
  updateMaxNewCardsPerDay,
} from '../utils/reviewQueue';

interface StudySettingsProps {
  onClose: () => void;
}

export function StudySettings({ onClose }: StudySettingsProps) {
  const [maxNewCards, setMaxNewCards] = useState(20);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const config = loadQueueConfig();
    setMaxNewCards(config.maxNewCardsPerDay);
  }, []);

  const handleSave = () => {
    updateMaxNewCardsPerDay(maxNewCards);
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Study Settings</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Max New Cards Per Day:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={maxNewCards}
            onChange={(e) => setMaxNewCards(parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            Limit how many new cards you study each day
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

