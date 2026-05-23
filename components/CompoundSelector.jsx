'use client';
import { getCompoundInfo } from '@/lib/calculator';

const COMPOUNDS = ['street', 'sport', 'semiSlick', 'race', 'drift', 'drag', 'rally', 'snow', 'offroad'];

export default function CompoundSelector({ selected, onSelect }) {
  return (
    <div className="compound-grid">
      {COMPOUNDS.map((compound) => {
        const info = getCompoundInfo(compound);
        const isActive = selected === compound;

        return (
          <button
            key={compound}
            type="button"
            className={`compound-card ${isActive ? 'compound-card--active' : ''}`}
            style={{ '--compound-color': info.color }}
            onClick={() => onSelect(compound)}
            aria-pressed={isActive}
          >
            <span className="compound-emoji">{info.emoji}</span>
            <span className="compound-name">{info.name}</span>
            <span className="compound-desc">{info.description}</span>
          </button>
        );
      })}
    </div>
  );
}
