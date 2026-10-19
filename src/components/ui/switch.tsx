import React, { useId } from 'react';
import styled from 'styled-components';

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
  className,
  trackColor,
  activeTrackColor,
  size,
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
    <StyledWrapper
      className={className}
      $trackColor={trackColor}
      $activeTrackColor={activeTrackColor}
      $size={size}
      style={style}
    >
      <div>
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          {...props}
        />
        <label className="switch" htmlFor={inputId}>
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
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  $trackColor?: string;
  $activeTrackColor?: string;
  $size?: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  display: inline-flex;
  align-items: center;

  /* The switch - the box around the slider */
  .switch {
    --a: 0.5s ease-out;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    height: ${(props) => props.$size || '2em'};
    border-radius: 2em;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
    aspect-ratio: 212.4992/84.4688;
    background-color: ${(props) => props.$trackColor || '#aaa'};
    transition: background-color var(--a), box-shadow var(--a), transform 0.2s ease;
  }

  .switch:hover {
    transform: scale(1.06);
  }

  .switch:active {
    transform: scale(0.96);
  }

  /* Hide default HTML checkbox */
  input[type="checkbox"],
  #check {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
    pointer-events: none;
  }

  .switch svg {
    height: 100%;
    width: 100%;
    display: block;
  }

  .switch svg path {
    color: #fff;
    stroke-width: 16;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 136 224;
    transition:
      stroke-dashoffset var(--a),
      transform 0s,
      color var(--a);
    transform-origin: center;
  }

  input[type="checkbox"]:checked ~ .switch svg path,
  #check:checked ~ .switch svg path {
    stroke-dashoffset: 180;
    transform: scaleY(-1);
  }

  input[type="checkbox"]:checked ~ .switch,
  #check:checked ~ .switch {
    background-color: ${(props) => props.$activeTrackColor || props.$trackColor || '#aaa'};
    box-shadow: 0 4px 18px rgba(255, 0, 0, 0.35);
  }
`;

export default Switch;
export { Switch };
