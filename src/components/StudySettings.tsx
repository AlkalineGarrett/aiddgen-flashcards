import { useState, useEffect } from 'react';
import {
  loadQueueConfig,
  saveQueueConfig,
  updateMaxNewCardsPerDay,
} from '../utils/reviewQueue';
import './components.css';

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
      className="study-settings-overlay"
      onClick={onClose}
    >
      <div
        className="study-settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="study-settings-title">Study Settings</h3>
        
        <div className="study-settings-field">
          <label className="study-settings-label">
            Max New Cards Per Day:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={maxNewCards}
            onChange={(e) => setMaxNewCards(parseInt(e.target.value) || 1)}
            className="study-settings-input"
          />
          <div className="study-settings-help">
            Limit how many new cards you study each day
          </div>
        </div>

        <div className="study-settings-actions">
          <button
            onClick={onClose}
            className="study-settings-button study-settings-button-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="study-settings-button study-settings-button-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

