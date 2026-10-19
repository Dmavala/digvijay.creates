export interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  stack: string;
  slug: string;
  imageUrl: string;
  description: string;
  url: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  date: string;
  leftPercent: number;
  widthPercent: number;
  text: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'zero-day',
    name: 'Zero-Day Vulnerability Research',
    client: 'ZERO DAY',
    date: '2025',
    stack: 'Binary Exploitation / C / Assembly',
    slug: 'zero-day',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format',
    description: 'Deep vulnerability discovery, binary analysis, and exploit mitigation.',
    url: '#',
  },
  {
    id: 'montage',
    name: 'Cinematic Montage & Rhythm',
    client: 'MONTAGE',
    date: '2024',
    stack: 'Premiere Pro / DaVinci Resolve',
    slug: 'montage',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format',
    description: 'Rhythmic pacing, visual juxtaposition, and high-impact editorial storytelling.',
    url: '#',
  },
  {
    id: 'exploit',
    name: 'Offensive Security & Pen Testing',
    client: 'EXPLOIT',
    date: '2024',
    stack: 'Burp Suite / Metasploit / Python',
    slug: 'exploit',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format',
    description: 'Red team simulation, vulnerability assessment, and defense auditing.',
    url: '#',
  },
  {
    id: 'timeline',
    name: 'Timeline Architecture',
    client: 'TIMELINE',
    date: '2024',
    stack: 'Post-Production / Multi-track Sync',
    slug: 'timeline',
    imageUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format',
    description: 'Sculpting temporal sequences, cut precision, and narrative structure.',
    url: '#',
  },
  {
    id: 'reverse-eng',
    name: 'Reverse Engineering',
    client: 'REVERSE ENG',
    date: '2024',
    stack: 'Ghidra / IDA Pro / x64dbg',
    slug: 'reverse-eng',
    imageUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&auto=format',
    description: 'Malware deconstruction, protocol analysis, and binary exploitation.',
    url: '#',
  },
  {
    id: 'color-grade',
    name: 'Atmospheric Color Grading',
    client: 'COLOR GRADE',
    date: '2023',
    stack: 'DaVinci Resolve / Film Convert',
    slug: 'color-grade',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format',
    description: 'Color science, film emulation, chiaroscuro contrast, and mood design.',
    url: '#',
  },
  {
    id: 'cipher',
    name: 'Applied Cryptography',
    client: 'CIPHER',
    date: '2025',
    stack: 'Rust / OpenSSL / ECC',
    slug: 'cipher',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format',
    description: 'Cryptographic protocols, zero-knowledge proofs, and secure cipher pipelines.',
    url: '#',
  },
  {
    id: 'keyframe',
    name: 'Motion & Keyframing',
    client: 'KEYFRAME',
    date: '2023',
    stack: 'After Effects / Kinetic Motion',
    slug: 'keyframe',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format',
    description: 'Interpolation dynamics, kinetic typography, and surgical frame timing.',
    url: '#',
  },
  {
    id: 'forensics',
    name: 'Digital Incident Forensics',
    client: 'FORENSICS',
    date: '2024',
    stack: 'Volatility / Wireshark / Linux',
    slug: 'forensics',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format',
    description: 'Memory dump forensics, network telemetry reconstruction, and threat attribution.',
    url: '#',
  },
  {
    id: 'sound-design',
    name: 'Acoustic Architecture',
    client: 'SOUND DESIGN',
    date: '2023',
    stack: 'Ableton Live / Pro Tools',
    slug: 'sound-design',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format',
    description: 'Sub-bass pulses, spatial Foley, tension risers, and sensory audio design.',
    url: '#',
  },
  {
    id: 'payload',
    name: 'Payload Development',
    client: 'PAYLOAD',
    date: '2024',
    stack: 'Shellcode / Evasion / C',
    slug: 'payload',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format',
    description: 'Custom execution vectors, evasion analysis, and penetration payloads.',
    url: '#',
  },
  {
    id: 'compositing',
    name: 'VFX & Compositing',
    client: 'COMPOSITING',
    date: '2024',
    stack: 'Nuke / After Effects',
    slug: 'compositing',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format',
    description: 'Seamless multi-pass compositing, optical aberrations, and visual effects.',
    url: '#',
  },
];

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'cybersecurity',
    label: 'CYBERSECURITY',
    date: '',
    leftPercent: 0,
    widthPercent: 33.333,
    text: 'Specializing in offensive security, vulnerability research, reverse engineering, and threat analysis.',
  },
  {
    id: 'code',
    label: 'CODE',
    date: '',
    leftPercent: 33.333,
    widthPercent: 33.333,
    text: 'Building high-performance interactive 3D web experiences, creative developer tools, and secure digital architectures.',
  },
  {
    id: 'video-editing',
    label: 'VIDEO EDITING',
    date: '',
    leftPercent: 66.666,
    widthPercent: 33.334,
    text: 'Sculpting cinematic pacing, visual rhythm, atmospheric color grading, and high-impact editorial storytelling.',
  },
];

export const CONTACT_EMAIL = 'digvijay.creates@gmail.com';

export interface SocialLink {
  /** Short label shown in the monumental contact list. */
  label: string;
  /** Human-readable destination, visible under the label and used for a11y. */
  handle: string;
  url: string;
  /** Screen-reader description of what the link opens. */
  description: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'MAIL',
    handle: CONTACT_EMAIL,
    url: `mailto:${CONTACT_EMAIL}`,
    description: 'Email Digvijay',
  },
  {
    label: 'LNKD',
    handle: '/in/digvijay-kohinkar',
    url: 'https://www.linkedin.com/in/digvijay-kohinkar-096693343',
    description: 'Digvijay on LinkedIn',
  },
  {
    label: 'INSTA',
    handle: '@digvijay.creates',
    url: 'https://www.instagram.com/digvijay.creates',
    description: 'Digvijay on Instagram',
  },
];
