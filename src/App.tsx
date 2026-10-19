import React, { useState, useEffect, useRef } from 'react';
import { MenuNav } from './components/roman/MenuNav';
import { LayoutOverlay } from './components/roman/LayoutOverlay';
import { HomeSection } from './components/roman/HomeSection';
import { AboutSection } from './components/roman/AboutSection';
import { ProjectsSection } from './components/roman/ProjectsSection';
import { ContactSection } from './components/roman/ContactSection';
import { PageTransitionOverlay } from './components/roman/PageTransitionOverlay';

export type SectionType = 'home' | 'projects' | 'about' | 'contact';

const SECTIONS: SectionType[] = ['home', 'projects', 'about', 'contact'];

const SECTION_LABELS: Record<SectionType, string> = {
  home: 'Home',
  projects: 'Work',
  about: 'About Me',
  contact: 'Contact',
};

/**
 * Keeps a hidden section out of the tab order and out of the accessibility
 * tree, and moves focus to the section that just became active so screen
 * readers announce the change.
 */
const SectionFrame: React.FC<{
  id: SectionType;
  isActive: boolean;
  isExiting: boolean;
  children: React.ReactNode;
}> = ({ id, isActive, isExiting, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasBeenActiveRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // `inert` is missing from some TS lib versions, so widen the element type.
    (el as HTMLDivElement & { inert?: boolean }).inert = !isActive;
    el.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  }, [isActive]);

  // Focus the newly opened section, but never steal focus on first paint.
  useEffect(() => {
    if (!isActive) return;
    if (!hasBeenActiveRef.current) {
      hasBeenActiveRef.current = true;
      return;
    }
    ref.current?.focus({ preventScroll: true });
  }, [isActive]);

  return (
    <div
      ref={ref}
      id={`section-${id}`}
      role="region"
      aria-label={SECTION_LABELS[id]}
      tabIndex={-1}
      className={`section-frame${isExiting ? ' section-exit' : ''}`}
    >
      {children}
    </div>
  );
};

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [displaySection, setDisplaySection] = useState<SectionType>('home');
  const [fromSection, setFromSection] = useState<SectionType>('home');
  const [toSection, setToSection] = useState<SectionType>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // Sections mount — and therefore start fetching their video — only once they
  // have been visited, so the first paint never downloads the About/Work media.
  const [visited, setVisited] = useState<SectionType[]>(['home']);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const activeSectionRef = useRef<SectionType>('home');
  const isTransitioningRef = useRef(false);
  const lastNavTimeRef = useRef(0);
  const wheelLockRef = useRef(false);
  const wheelResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overscrollDeltaRef = useRef(0);
  const overscrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Disable automatic browser scroll restoration so sections always load cleanly
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const navigateToSection = (section: SectionType) => {
    if (activeSectionRef.current === section || isTransitioningRef.current) return;

    const from = activeSectionRef.current;

    // Smooth optical zoom transition between home reel and zoomed work view
    if ((from === 'home' && section === 'projects') || (from === 'projects' && section === 'home')) {
      setActiveSection(section);
      setDisplaySection(section);
      activeSectionRef.current = section;
      window.history.replaceState(null, '', `#${section}`);
      return;
    }

    setFromSection(from);
    setToSection(section);
    setActiveSection(section);
    activeSectionRef.current = section;
    setIsTransitioning(true);
    isTransitioningRef.current = true;
    wheelLockRef.current = true;
    lastNavTimeRef.current = Date.now();
    window.history.replaceState(null, '', `#${section}`);

    // Mount the destination before the flash covers the screen, so its media
    // has the whole transition to warm up.
    setVisited((prev) => (prev.includes(section) ? prev : [...prev, section]));

    // Pre-position the projects list for entering from the top vs the bottom.
    if (section === 'projects') {
      window.setTimeout(() => {
        const container = document.querySelector('.projects-container');
        if (container) {
          container.scrollTop = from === 'about' ? container.scrollHeight : 0;
        }
      }, 160);
    }

    // Pre-position the about section: always start at the top
    if (section === 'about') {
      window.setTimeout(() => {
        const container = document.querySelector('.about-scroll-container');
        if (container) {
          container.scrollTop = 0;
        }
      }, 160);
    }

    // Behind the solid red aperture hold, swap the live section at 160ms.
    window.setTimeout(() => {
      setDisplaySection(section);
    }, 160);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    isTransitioningRef.current = false;
    if (wheelResetTimeoutRef.current) clearTimeout(wheelResetTimeoutRef.current);
    wheelResetTimeoutRef.current = setTimeout(() => {
      wheelLockRef.current = false;
    }, 300);
  };

  const nextSection = () => {
    if (isTransitioningRef.current || wheelLockRef.current) return;
    if (activeSectionRef.current === 'home') {
      navigateToSection('about');
      return;
    }
    const currentIndex = SECTIONS.indexOf(activeSectionRef.current);
    if (currentIndex < SECTIONS.length - 1) {
      navigateToSection(SECTIONS[currentIndex + 1]);
    }
  };

  const prevSection = () => {
    if (isTransitioningRef.current || wheelLockRef.current) return;
    if (activeSectionRef.current === 'about') {
      navigateToSection('home');
      return;
    }
    const currentIndex = SECTIONS.indexOf(activeSectionRef.current);
    if (currentIndex > 0) {
      navigateToSection(SECTIONS[currentIndex - 1]);
    }
  };

  // Sync with the URL hash on mount and on every hashchange.
  useEffect(() => {
    const handleHash = () => {
      let hash = window.location.hash.replace('#', '') as SectionType;
      if (hash === ('posters' as any)) {
        hash = 'about';
        window.history.replaceState(null, '', '#about');
      }
      if (!SECTIONS.includes(hash)) return;
      setVisited((prev) => (prev.includes(hash) ? prev : [...prev, hash]));
      navigateToSection(hash);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'm' || e.key === 'M') {
        const target = e.target as HTMLElement | null;
        if (!target || !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
          setIsMuted((prev) => !prev);
        }
        return;
      }

      if (isTransitioningRef.current || wheelLockRef.current) return;

      // On home or projects (film reel), the reel handles its own navigation — do not change section
      if (activeSectionRef.current === 'home' || activeSectionRef.current === 'projects') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (activeSectionRef.current === 'about') {
          const container = document.querySelector('.about-scroll-container');
          if (container) {
            const isAtBottom =
              container.scrollTop + container.clientHeight >= container.scrollHeight - 25;
            if (!isAtBottom) {
              container.scrollBy({ top: 220, behavior: 'smooth' });
              return;
            }
          }
        }
        nextSection();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (activeSectionRef.current === 'about') {
          const container = document.querySelector('.about-scroll-container');
          if (container) {
            const isAtTop = container.scrollTop <= 15;
            if (!isAtTop) {
              container.scrollBy({ top: -220, behavior: 'smooth' });
              return;
            }
          }
        }
        prevSection();
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToSection(SECTIONS[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToSection(SECTIONS[SECTIONS.length - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wheel Scroll Navigation with intentional resistance & boundary buffers
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioningRef.current || wheelLockRef.current) return;
      if (Date.now() - lastNavTimeRef.current < 850) return;

      // Ignore micro-scroll / trackpad jitter
      if (Math.abs(e.deltaY) < 30) return;

      // On home and projects (the 3D film reel), reel owns all vertical scroll
      if (activeSectionRef.current === 'home' || activeSectionRef.current === 'projects') return;

      // On about section: allow full internal scrolling and require strong deliberate overscroll at boundaries
      if (activeSectionRef.current === 'about') {
        const container = document.querySelector('.about-scroll-container');
        if (container) {
          const isAtBottom =
            container.scrollTop + container.clientHeight >= container.scrollHeight - 20;
          const isAtTop = container.scrollTop <= 10;

          if (e.deltaY > 0) {
            if (!isAtBottom) {
              overscrollDeltaRef.current = 0;
              return;
            }
            // At bottom: accumulate overscroll delta so inertia doesn't yank to Contact
            overscrollDeltaRef.current += e.deltaY;
            if (overscrollTimeoutRef.current) clearTimeout(overscrollTimeoutRef.current);
            overscrollTimeoutRef.current = setTimeout(() => {
              overscrollDeltaRef.current = 0;
            }, 450);

            // Require substantial deliberate push (450+ delta) before advancing
            if (overscrollDeltaRef.current < 450) {
              return;
            }
            overscrollDeltaRef.current = 0;
          } else {
            if (!isAtTop) {
              overscrollDeltaRef.current = 0;
              return;
            }
            // At top: accumulate upward overscroll delta before rewinding to Home
            overscrollDeltaRef.current += Math.abs(e.deltaY);
            if (overscrollTimeoutRef.current) clearTimeout(overscrollTimeoutRef.current);
            overscrollTimeoutRef.current = setTimeout(() => {
              overscrollDeltaRef.current = 0;
            }, 450);

            if (overscrollDeltaRef.current < 450) {
              return;
            }
            overscrollDeltaRef.current = 0;
          }
        }
      }

      // On contact section: require deliberate upward scroll resistance before returning to About
      if (activeSectionRef.current === 'contact') {
        if (e.deltaY < 0) {
          overscrollDeltaRef.current += Math.abs(e.deltaY);
          if (overscrollTimeoutRef.current) clearTimeout(overscrollTimeoutRef.current);
          overscrollTimeoutRef.current = setTimeout(() => {
            overscrollDeltaRef.current = 0;
          }, 450);

          if (overscrollDeltaRef.current < 400) {
            return;
          }
          overscrollDeltaRef.current = 0;
        } else {
          return;
        }
      }

      if (e.deltaY > 0) {
        nextSection();
      } else {
        prevSection();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch Swipe Navigation
  useEffect(() => {
    let startY = 0;
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current || wheelLockRef.current) return;
      if (Date.now() - lastNavTimeRef.current < 650) return;

      const diffY = startY - e.changedTouches[0].clientY;
      const diffX = startX - e.changedTouches[0].clientX;

      if (Math.abs(diffY) > 85 && Math.abs(diffY) > Math.abs(diffX)) {
        // On the home section, FilmReelCanvas handles its own drag/swipe
        if (activeSectionRef.current === 'home') return;

        if (diffY > 0) {
          // Swipe up -> next section, but never yank the page out of the
          // projects list before the user has reached its end.
          if (activeSectionRef.current === 'projects') {
            const container = document.querySelector('.projects-container');
            if (container) {
              const isAtBottom =
                container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
              if (!isAtBottom) return;
            }
          }
          if (activeSectionRef.current === 'about') {
            const container = document.querySelector('.about-scroll-container');
            if (container) {
              const isAtBottom =
                container.scrollTop + container.clientHeight >= container.scrollHeight - 20;
              if (!isAtBottom) return;
            }
          }
          nextSection();
        } else {
          if (activeSectionRef.current === 'projects') {
            const container = document.querySelector('.projects-container');
            if (container && container.scrollTop > 10) return;
          }
          if (activeSectionRef.current === 'about') {
            const container = document.querySelector('.about-scroll-container');
            if (container && container.scrollTop > 20) return;
          }
          prevSection();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExiting = (section: SectionType) =>
    isTransitioning && displaySection === section && fromSection === section;

  const isActive = (section: SectionType) => displaySection === section;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* 15-Column Layout Grid Lines Overlay */}
      <LayoutOverlay />

      {/* Side Rotated Navigation Menu */}
      <MenuNav activeSection={activeSection} onSelectSection={navigateToSection} />

      {/* 4 Interactive Fullscreen Sections */}
      <div className="relative w-full h-full">
        <SectionFrame
          id="home"
          isActive={isActive('home') || isActive('projects')}
          isExiting={isExiting('home') && toSection !== 'projects'}
        >
          <HomeSection
            isActive={isActive('home') || isActive('projects')}
            isZoomed={displaySection === 'projects'}
            onZoomIn={() => {
              setActiveSection('projects');
              setDisplaySection('projects');
              activeSectionRef.current = 'projects';
              window.history.replaceState(null, '', '#projects');
            }}
            onZoomOut={() => {
              setActiveSection('home');
              setDisplaySection('home');
              activeSectionRef.current = 'home';
              window.history.replaceState(null, '', '#home');
            }}
            isMuted={isMuted}
            onNavigateNext={nextSection}
          />
        </SectionFrame>

        {/* About Me Section */}
        <SectionFrame id="about" isActive={isActive('about')} isExiting={isExiting('about')}>
          {visited.includes('about') && <AboutSection isActive={isActive('about')} />}
        </SectionFrame>

        {/* Work section is now seamlessly integrated into the 3D film reel */}
        <SectionFrame id="projects" isActive={false} isExiting={false}>
          <ProjectsSection isActive={false} />
        </SectionFrame>

        <SectionFrame id="contact" isActive={isActive('contact')} isExiting={isExiting('contact')}>
          {visited.includes('contact') && <ContactSection isActive={isActive('contact')} />}
        </SectionFrame>
      </div>

      {/* Signature 15-Column Curtain + Red Perspective Shutter Transition */}
      <PageTransitionOverlay
        isTransitioning={isTransitioning}
        fromSection={fromSection}
        toSection={toSection}
        prefersReducedMotion={prefersReducedMotion}
        onTransitionComplete={handleTransitionComplete}
      />
    </main>
  );
};

export default App;
