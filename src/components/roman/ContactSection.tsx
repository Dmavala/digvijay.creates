import React, { useState } from 'react';
import { SOCIAL_LINKS } from '../../data/romanData';

interface ContactSectionProps {
  isActive: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ isActive }) => {
  const [isWobbling, setIsWobbling] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<'MAIL' | 'LNKD' | 'INSTA' | null>(null);

  const triggerWobble = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 500);
  };

  return (
    <div
      className={`section page__contact !p-0 flex flex-col justify-center items-center relative select-none ${
        isActive ? 'active' : ''
      }`}
      id="contact"
    >
      <div className="relative flex flex-col items-center justify-center text-center z-10 px-4">
        {/* Monumental MEET ME Heading with buttery-smooth layered opacity crossfade and subtle lift */}
        <div
          className="relative mb-4 select-none"
          style={{
            transform: hoveredSocial ? 'translateY(-6px) scale(1.012)' : 'translateY(0) scale(1)',
            transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          <h2
            className={`reveal-rise ${isActive ? 'is-revealed' : ''} font-anton text-[clamp(5rem,13vw,14rem)] leading-[0.85] tracking-tight uppercase select-none grid place-items-center`}
            style={{ animationDelay: '180ms' }}
          >
            {/* Accessible screen reader announcement */}
            <span className="sr-only">MEET ME</span>

            {/* Resting Base Red Layer */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none"
              style={{
                gridArea: '1 / 1 / 2 / 2',
                color: '#ff0000',
                opacity: hoveredSocial === null ? 1 : 0,
                transition: 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'opacity',
              }}
            >
              MEET ME
            </span>

            {/* Emerald Green Layer (MAIL) */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none"
              style={{
                gridArea: '1 / 1 / 2 / 2',
                color: '#22c55e',
                filter: 'drop-shadow(0 0 50px rgba(34, 197, 94, 0.55))',
                opacity: hoveredSocial === 'MAIL' ? 1 : 0,
                transition: 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1), filter 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'opacity, filter',
              }}
            >
              MEET ME
            </span>

            {/* LinkedIn Blue Layer (LNKD) */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none"
              style={{
                gridArea: '1 / 1 / 2 / 2',
                color: '#0b66c2',
                filter: 'drop-shadow(0 0 50px rgba(11, 102, 194, 0.6))',
                opacity: hoveredSocial === 'LNKD' ? 1 : 0,
                transition: 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1), filter 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'opacity, filter',
              }}
            >
              MEET ME
            </span>

            {/* Instagram Rainbow Gradient Layer (INSTA) */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none"
              style={{
                gridArea: '1 / 1 / 2 / 2',
                backgroundImage: 'linear-gradient(45deg, #f58529 0%, #dd2a7b 35%, #8134af 70%, #515bd4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 50px rgba(221, 42, 123, 0.6))',
                opacity: hoveredSocial === 'INSTA' ? 1 : 0,
                transition: 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1), filter 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'opacity, filter',
              }}
            >
              MEET ME
            </span>
          </h2>
        </div>

        {/* Links: MAIL, LNKD, INSTA */}
        <nav aria-label="Contact and social links" className="mt-2">
          <ul className="contact-list flex flex-wrap justify-center items-start gap-x-8 gap-y-5 md:gap-x-14">
            {SOCIAL_LINKS.map((link, index) => {
              const isMail = link.url.startsWith('mailto');
              const isHovered = hoveredSocial === link.label;

              return (
                <li
                  key={link.label}
                  className={`reveal-rise ${isActive ? 'is-revealed' : ''}`}
                  style={{ animationDelay: `${250 + index * 70}ms` }}
                >
                  <a
                    href={link.url}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener noreferrer'}
                    aria-label={`${link.description} — ${link.handle}`}
                    onMouseEnter={() => setHoveredSocial(link.label as any)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    onFocus={() => setHoveredSocial(link.label as any)}
                    onBlur={() => setHoveredSocial(null)}
                    className="group flex flex-col items-center gap-1 cursor-pointer"
                    style={{
                      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                      transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* Link Label: layered crossfade */}
                    <div className="relative grid place-items-center text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                      {/* Resting White label */}
                      <span
                        className="select-none"
                        style={{
                          gridArea: '1 / 1 / 2 / 2',
                          color: 'rgba(255, 255, 255, 0.9)',
                          opacity: isHovered ? 0 : 1,
                          transition: 'opacity 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                          willChange: 'opacity',
                        }}
                      >
                        {link.label}
                      </span>

                      {/* Active Colored/Gradient label */}
                      <span
                        aria-hidden="true"
                        className="select-none pointer-events-none"
                        style={{
                          gridArea: '1 / 1 / 2 / 2',
                          opacity: isHovered ? 1 : 0,
                          color:
                            link.label === 'MAIL'
                              ? '#22c55e'
                              : link.label === 'LNKD'
                              ? '#0b66c2'
                              : 'transparent',
                          backgroundImage:
                            link.label === 'INSTA'
                              ? 'linear-gradient(45deg, #f58529 0%, #dd2a7b 35%, #8134af 70%, #515bd4 100%)'
                              : undefined,
                          WebkitBackgroundClip: link.label === 'INSTA' ? 'text' : undefined,
                          WebkitTextFillColor: link.label === 'INSTA' ? 'transparent' : undefined,
                          filter:
                            link.label === 'MAIL'
                              ? 'drop-shadow(0 0 16px rgba(34, 197, 94, 0.7))'
                              : link.label === 'LNKD'
                              ? 'drop-shadow(0 0 16px rgba(11, 102, 194, 0.7))'
                              : 'drop-shadow(0 0 16px rgba(221, 42, 123, 0.7))',
                          transition: 'opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), filter 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                          willChange: 'opacity, filter',
                        }}
                      >
                        {link.label}
                      </span>
                    </div>

                    {/* Subtext Handle */}
                    <span
                      className="font-mono text-[0.6rem] md:text-[0.68rem] tracking-tight break-all"
                      style={{
                        color: isHovered
                          ? link.label === 'MAIL'
                            ? 'rgba(34, 197, 94, 0.95)'
                            : link.label === 'LNKD'
                            ? 'rgba(11, 102, 194, 0.95)'
                            : 'rgba(221, 42, 123, 0.95)'
                          : 'rgba(255, 255, 255, 0.35)',
                        transition: 'color 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {link.handle}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Illustrated Red Peace Hand Sticker (✌️) — decorative, so hidden from AT */}
        {/* Fades rather than rises: this element owns its own transform (the -rotate-12
            and the click wobble), so an animation on transform would clobber it. */}
        <div
          aria-hidden="true"
          onClick={triggerWobble}
          className={`absolute -bottom-24 sm:-bottom-28 right-0 sm:-right-20 md:-right-32 w-28 h-36 md:w-36 md:h-44 cursor-pointer transition-all duration-200 hover:scale-110 -rotate-12 ${
            isActive ? 'opacity-100' : 'opacity-0'
          } ${isWobbling ? 'animate-bounce' : 'hover:-rotate-6'}`}
          style={{ transitionDelay: isActive ? '460ms' : '0ms' }}
          title="Peace!"
        >
          <svg
            viewBox="0 0 160 200"
            className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Thick White Die-Cut Sticker Outline */}
            <path
              d="M 50 185 
                 L 50 135 
                 C 40 128 32 118 34 105 
                 C 36 92 48 94 54 102 
                 L 52 48 
                 C 52 32 68 32 70 48 
                 L 72 82 
                 L 82 38 
                 C 84 22 100 24 100 40 
                 L 96 95 
                 C 104 94 112 98 112 106 
                 C 114 114 108 120 108 122 
                 C 114 125 116 132 112 140 
                 C 108 146 102 150 98 150 
                 L 98 185 
                 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="16"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Red Interior Hand Fill */}
            <path
              d="M 50 185 
                 L 50 135 
                 C 40 128 32 118 34 105 
                 C 36 92 48 94 54 102 
                 L 52 48 
                 C 52 32 68 32 70 48 
                 L 72 82 
                 L 82 38 
                 C 84 22 100 24 100 40 
                 L 96 95 
                 C 104 94 112 98 112 106 
                 C 114 114 108 120 108 122 
                 C 114 125 116 132 112 140 
                 C 108 146 102 150 98 150 
                 L 98 185 
                 Z"
              fill="#ff0000"
            />

            {/* White Interior Crease Details */}
            {/* Index finger crease */}
            <path
              d="M 68 85 L 68 115"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Middle finger crease */}
            <path
              d="M 85 88 L 85 115"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Folded Ring Finger Crease */}
            <path
              d="M 92 105 C 102 106 106 114 98 120"
              stroke="#ffffff"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Folded Pinky Crease */}
            <path
              d="M 94 124 C 104 126 106 134 96 140"
              stroke="#ffffff"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Thumb crossing over */}
            <path
              d="M 40 110 C 46 104 62 106 76 118 C 82 124 78 132 68 134 C 58 136 50 128 46 122"
              stroke="#ffffff"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Wrist / Palm Bottom Crease */}
            <path
              d="M 58 155 C 68 162 80 162 90 156"
              stroke="#ffffff"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
