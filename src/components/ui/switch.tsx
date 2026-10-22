import React, { useId } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  trackColor?: string;
  activeTrackColor?: string;
  size?: string;
}

const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  defaultChecked,
  onChange,
  onCheckedChange,
  className = '',
  trackColor = '#2c4157',
  activeTrackColor = '#ff0000',
  size = '2em',
  style,
  ...props
}) => {
  const autoId = useId();
  const inputId = id || `switch-${autoId}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onCheckedChange) onCheckedChange(e.target.checked);
  };

  return (
    <div
      className={`theme-switch-container ${className}`}
      style={
        {
          '--switch-size': size,
          '--switch-track': trackColor,
          '--switch-active-track': activeTrackColor,
          ...style,
        } as React.CSSProperties
      }
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        className="theme-switch-input"
        {...props}
      />
      <label className="theme-switch-label" htmlFor={inputId}>
        <svg viewBox="0 0 212.4992 84.4688" overflow="visible">
          <path
            pathLength={360}
            fill="none"
            stroke="currentColor"
            d="M 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 A 42.24 42.24 90 0 0 84.4992 42.2496 A 42.24 42.24 90 0 0 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 L 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 A 42.24 42.24 90 0 0 128 42.2496 A 42.24 42.24 90 0 0 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 L 42.2496 0"
          />
        </svg>
      </label>
    </div>
  );
};

export default Switch;
export { Switch };
