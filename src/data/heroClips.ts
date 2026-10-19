export interface HeroClip {
  id: string;
  title: string;
  category: string;
  src: string;
}

export const HERO_CLIPS: HeroClip[] = [
  {
    id: 'gt_final',
    title: 'CONTINENTAL GT',
    category: 'CINEMATIC EDIT',
    src: '/clips/gt_final.mp4',
  },
  {
    id: 'butterfly',
    title: 'BUTTERFLY',
    category: 'CREATIVE EDIT',
    src: '/clips/butterfly.mp4',
  },
  {
    id: 'chintamani',
    title: 'CHINTAMANI',
    category: 'DEVOTIONAL CUT',
    src: '/clips/chintamani.mp4',
  },
  {
    id: 'eye',
    title: 'THE EYE',
    category: 'MACRO EDIT',
    src: '/clips/eye.mp4',
  },
  {
    id: 'portfolio',
    title: 'CREATIVE REEL',
    category: 'DIRECTOR CUT',
    src: '/portfolio.mp4',
  },
  {
    id: 'south_melody',
    title: 'SOUTH MELODY',
    category: 'THEME EDIT',
    src: '/clips/south_melody.mp4',
  },
  {
    id: 'color_grade',
    title: 'COLOR GRADE',
    category: 'GRADING REEL',
    src: '/clips/color_grade.mp4',
  },
  {
    id: 'mor',
    title: 'MOR',
    category: 'CINEMATIC CUT',
    src: '/clips/mor.mp4',
  },
  {
    id: 'ready_or_not',
    title: 'READY OR NOT',
    category: 'ACTION EDIT',
    src: '/clips/ready_or_not.mp4',
  },
];
