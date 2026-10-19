import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`w-full max-w-5xl transition-all duration-300 rounded-full px-5 py-3 flex items-center justify-between ${
          isScrolled
            ? 'glass-panel shadow-2xl shadow-black/40 border-zinc-800/80 backdrop-blur-xl'
            : 'bg-zinc-950/40 backdrop-blur-md border border-white/5'
        }`}
      >
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-tr from-red-500 to-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          <span>digvijay<span className="text-red-400 font-mono">.creates</span></span>
          <span className="hidden sm:inline font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 tracking-wider">AGENCY</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {['Showreel', 'Services', 'Work', 'Process', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-full transition-colors hover:bg-white/5"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Status Badge & Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Badge variant="success" dot pulse>
            Taking 2 Clients
          </Badge>
          <a
            href="#contact"
            className="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10"
          >
            <span>Book a Call</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-zinc-400 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 glass-panel p-6 rounded-2xl md:hidden flex flex-col gap-4 border border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-2">
            {['Work', 'About', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <Badge variant="success" dot pulse>
              Available
            </Badge>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
