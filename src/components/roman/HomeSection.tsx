import React from 'react';
import { FilmReelCanvas } from './FilmReelCanvas';

interface HomeSectionProps {
  isActive: boolean;
  isMuted?: boolean;
  isZoomed?: boolean;
  onZoomIn?: (clipIndex?: number) => void;
  onZoomOut?: () => void;
  onNavigateNext?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  isActive,
  isMuted = true,
  isZoomed = false,
  onZoomIn,
  onZoomOut,
  onNavigateNext,
}) => {
  return (
    <div
      className={`section page__home !p-0 relative w-full h-full overflow-hidden ${isActive ? 'active' : ''}`}
      id="home"
    >
      <FilmReelCanvas
        isActive={isActive}
        isMuted={isMuted}
        isZoomed={isZoomed}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
};
