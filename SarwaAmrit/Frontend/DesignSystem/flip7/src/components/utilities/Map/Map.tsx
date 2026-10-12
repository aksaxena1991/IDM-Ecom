import React from 'react';
import '../utilities.css';

export interface MapPin {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface MapProps {
  pins?: MapPin[];
  className?: string;
}

const DEFAULT_PINS: MapPin[] = [
  { id: 'a', x: 30, y: 40, label: 'Maya' },
  { id: 'b', x: 62, y: 48, label: 'Riley' },
  { id: 'c', x: 48, y: 70, label: 'Kai' },
];

export const Map: React.FC<MapProps> = ({ pins = DEFAULT_PINS, className = '' }) => (
  <div className={['f7-map', className].filter(Boolean).join(' ')}>
    <svg className="f7-map-svg" viewBox="0 0 100 80">
      <ellipse cx="50" cy="40" rx="42" ry="28" fill="#2BA8A2" />
      <ellipse cx="50" cy="40" rx="28" ry="16" fill="#3CC4BD" />
      {pins.map((pin) => (
        <g key={pin.id}>
          <circle cx={pin.x} cy={pin.y} r="4" fill="#FFD23F" stroke="#1E8C86" strokeWidth="1" />
          <text x={pin.x} y={pin.y - 6} textAnchor="middle" fontSize="4" fill="#FFF8E7" fontWeight="800">
            {pin.label}
          </text>
        </g>
      ))}
    </svg>
  </div>
);
Map.displayName = 'Map';
