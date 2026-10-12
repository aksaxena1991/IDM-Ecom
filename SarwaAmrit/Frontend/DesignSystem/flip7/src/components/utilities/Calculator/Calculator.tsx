import React, { useState } from 'react';
import '../utilities.css';

export interface CalculatorProps {
  className?: string;
}

export const Calculator: React.FC<CalculatorProps> = ({ className = '' }) => {
  const [display, setDisplay] = useState('0');
  const [store, setStore] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const input = (d: string) => {
    setDisplay((cur) => (fresh || cur === '0' ? d : `${cur}${d}`));
    setFresh(false);
  };
  const operate = (next: string) => {
    const n = Number(display);
    if (store !== null && op) {
      const result = op === '+' ? store + n : op === '−' ? store - n : op === '×' ? store * n : store / n;
      setStore(result);
      setDisplay(String(result));
    } else {
      setStore(n);
    }
    setOp(next);
    setFresh(true);
  };
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', 'C', '0', '=', '+'];

  return (
    <div className={['f7-calc', className].filter(Boolean).join(' ')}>
      <div className="f7-calc-display">{display}</div>
      <div className="f7-calc-grid">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className={['f7-calc-key', key === '=' ? 'f7-calc-key--gold' : '', key === 'C' ? 'f7-calc-key--coral' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (key === 'C') {
                setDisplay('0');
                setStore(null);
                setOp(null);
              } else if (key === '=') operate(op ?? '+');
              else if ('÷×−+'.includes(key)) operate(key);
              else input(key);
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};
Calculator.displayName = 'Calculator';
