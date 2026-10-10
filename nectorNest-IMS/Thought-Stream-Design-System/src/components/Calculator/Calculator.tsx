import React, { useState, useRef } from 'react';
import './Calculator.css';
import { History, Delete, Trash2 } from 'lucide-react';

export interface CalculatorHistoryItem {
  id: string;
  expression: string;
  result: string;
}

export interface CalculatorProps {
  /** Initial displayed value */
  defaultValue?: string;
  /** Callback fired when a calculation completes */
  onCalculate?: (result: number, historyItem: CalculatorHistoryItem) => void;
  /** Enable history tape pane */
  allowHistory?: boolean;
  /** Initial calculation history */
  defaultHistory?: CalculatorHistoryItem[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThoughtStream Calculator Component
 *
 * Contemplative desktop calculator with 0px geometry,
 * hairline borders, monospace readouts, and history tape.
 */
export const Calculator: React.FC<CalculatorProps> = ({
  defaultValue = '0',
  onCalculate,
  allowHistory = true,
  defaultHistory = [],
  className = '',
  style,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(defaultValue);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('');

  const [history, setHistory] = useState<CalculatorHistoryItem[]>(defaultHistory);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (numStr: string): string => {
    if (numStr === 'Error' || numStr === 'Infinity') return numStr;
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clearAll = () => {
    setDisplayValue('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue('0');
    }
  };

  const toggleSign = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      setDisplayValue(String(-val));
    }
  };

  const inputPercent = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      setDisplayValue(String(val / 100));
    }
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '−':
      case '-':
        return first - second;
      case '×':
      case '*':
        return first * second;
      case '÷':
      case '/':
        return second === 0 ? Infinity : first / second;
      default:
        return second;
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setExpression(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      const currentValue = prevValue || 0;
      const result = calculate(currentValue, inputValue, operator);
      setPrevValue(result);
      setDisplayValue(String(result));
      setExpression(`${result} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(displayValue);

    if (operator && prevValue !== null) {
      const result = calculate(prevValue, inputValue, operator);
      const exprStr = `${prevValue} ${operator} ${inputValue} =`;
      const resultStr = String(result);

      setDisplayValue(resultStr);
      setExpression(exprStr);
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);

      const historyItem: CalculatorHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        expression: exprStr,
        result: resultStr,
      };

      setHistory((prev) => [historyItem, ...prev]);
      onCalculate?.(result, historyItem);
    }
  };

  const recallHistory = (item: CalculatorHistoryItem) => {
    setDisplayValue(item.result);
    setWaitingForOperand(true);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Keyboard support when focused/hovered
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      inputDigit(e.key);
    } else if (e.key === '.') {
      e.preventDefault();
      inputDecimal();
    } else if (e.key === '=' || e.key === 'Enter') {
      e.preventDefault();
      handleEquals();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      e.preventDefault();
      clearAll();
    } else if (e.key === '+') {
      e.preventDefault();
      performOperation('+');
    } else if (e.key === '-') {
      e.preventDefault();
      performOperation('−');
    } else if (e.key === '*') {
      e.preventDefault();
      performOperation('×');
    } else if (e.key === '/') {
      e.preventDefault();
      performOperation('÷');
    } else if (e.key === '%') {
      e.preventDefault();
      inputPercent();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`ts-calculator ${className}`.trim()}
      style={style}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Calculator"
    >
      {/* Top Header Bar */}
      {allowHistory && (
        <div className="ts-calculator-top-bar">
          <span>ThoughtStream Calc</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {history.length > 0 && showHistory && (
              <button
                type="button"
                className="ts-calculator-history-toggle"
                onClick={clearHistory}
                title="Clear tape history"
              >
                <Trash2 size={12} />
              </button>
            )}
            <button
              type="button"
              className="ts-calculator-history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History size={13} />
              <span>{showHistory ? 'Hide Tape' : 'History'}</span>
            </button>
          </div>
        </div>
      )}

      {/* History Tape Drawer */}
      {allowHistory && showHistory && (
        <div className="ts-calculator-history-drawer">
          {history.length === 0 ? (
            <div className="ts-calculator-history-empty">No calculations yet</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="ts-calculator-history-item"
                onClick={() => recallHistory(item)}
                title="Click to recall result"
              >
                <span className="ts-calculator-history-expr">{item.expression}</span>
                <span className="ts-calculator-history-res">{item.result}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Numerical Display Pane */}
      <div className="ts-calculator-display" aria-live="polite">
        <div className="ts-calculator-expression">{expression}</div>
        <div className="ts-calculator-result">{formatNumber(displayValue)}</div>
      </div>

      {/* Keypad Grid */}
      <div className="ts-calculator-keypad" role="grid">
        {/* Row 1 */}
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--action"
          onClick={clearAll}
        >
          {displayValue === '0' && !prevValue ? 'AC' : 'C'}
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--action"
          onClick={toggleSign}
        >
          ±
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--action"
          onClick={inputPercent}
        >
          %
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--operator"
          onClick={() => performOperation('÷')}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('7')}>
          7
        </button>
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('8')}>
          8
        </button>
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('9')}>
          9
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--operator"
          onClick={() => performOperation('×')}
        >
          ×
        </button>

        {/* Row 3 */}
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('4')}>
          4
        </button>
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('5')}>
          5
        </button>
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('6')}>
          6
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--operator"
          onClick={() => performOperation('−')}
        >
          −
        </button>

        {/* Row 4 */}
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('1')}>
          1
        </button>
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('2')}>
          2
        </button>
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('3')}>
          3
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--operator"
          onClick={() => performOperation('+')}
        >
          +
        </button>

        {/* Row 5 */}
        <button type="button" className="ts-calculator-btn" onClick={() => inputDigit('0')}>
          0
        </button>
        <button type="button" className="ts-calculator-btn" onClick={inputDecimal}>
          .
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--action"
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          <Delete size={17} />
        </button>
        <button
          type="button"
          className="ts-calculator-btn ts-calculator-btn--equals"
          onClick={handleEquals}
        >
          =
        </button>
      </div>
    </div>
  );
};

Calculator.displayName = 'Calculator';
