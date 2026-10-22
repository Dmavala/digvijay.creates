import React from 'react';

interface MenuNavProps {
  activeSection: string;
  onSelectSection: (section: 'home' | 'projects' | 'about' | 'contact') => void;
}

export const MenuNav: React.FC<MenuNavProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const menuItems: { id: 'home' | 'projects' | 'about' | 'contact'; label: string; href: string }[] = [
    { id: 'contact', label: 'CONTACT', href: '#contact' },
    { id: 'about', label: 'ABOUT ME', href: '#about' },
    { id: 'projects', label: 'WORK', href: '#projects' },
    { id: 'home', label: 'HOME', href: '#home' },
  ];

  return (
    <nav className="layout__menu select-none" aria-label="Main Navigation">
      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onSelectSection(item.id);
            }}
            className={`menu-link ${isActive ? 'active bg-[#dc0000] text-white' : 'text-white/80 hover:text-white'}`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
};
