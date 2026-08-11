import React from 'react';

export interface StudentVotes {
  tech_guru?: number;
  most_creative?: number;
  class_scholar?: number;
  most_famous?: number;
  best_smile?: number;
  next_ceo?: number;
  style_icon?: number;
  class_comedian?: number;
  sports_mvp?: number;
  quiet_achiever?: number;
  world_traveler?: number;
  unsung_hero?: number;
  [key: string]: number | undefined;
}

export interface CommentItem {
  id: string;
  studentId: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'admin';
  text: string;
  createdAt: string;
  status?: 'approved' | 'pending';
}

export interface PendingProfileUpdate {
  quote?: string;
  hobbies?: string;
  careerPath?: string;
  photoFilename?: string;
  email?: string;
  phone?: string;
  submittedAt: string;
  submittedBy: string;
}

export interface Student {
  id: string;
  fullName: string;
  examNumber: string;
  photoFilename: string;
  birthDate: string;
  votes: StudentVotes;
  quote: string;
  hobbies?: string;
  careerPath?: string;
  email?: string;
  phone?: string;
  featuredOnHome?: boolean;
  pendingProfileUpdate?: PendingProfileUpdate;
  createdAt?: any;
}

export interface SuperlativeCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const SUPERLATIVES: SuperlativeCategory[] = [
  { id: "tech_guru", title: "Tech Guru & Innovator", description: "Most likely to build the next big app or fix everyone's tech issues.", iconName: "Laptop" },
  { id: "most_creative", title: "Most Creative Mind", description: "Mastermind behind art, design, video edits, and creative projects.", iconName: "Palette" },
  { id: "class_scholar", title: "Class Scholar", description: "Consistently aces tests and helps everyone with study guides.", iconName: "BookOpen" },
  { id: "most_famous", title: "Most Likely to Become Famous", description: "Future star whose name everyone expects in lights or headlines.", iconName: "Crown" },
  { id: "best_smile", title: "Best Smile & Energy", description: "Lights up any room and turns around anyone's bad day.", iconName: "Smile" },
  { id: "next_ceo", title: "Next Top CEO", description: "Natural entrepreneur always executing ideas and leading teams.", iconName: "Briefcase" },
  { id: "style_icon", title: "Best Dressed / Style Icon", description: "Always brings high-level fashion and style to school.", iconName: "Shirt" },
  { id: "class_comedian", title: "Class Comedian", description: "Master of quick wit, jokes, and keeping everyone laughing.", iconName: "Laugh" },
  { id: "sports_mvp", title: "Most Athletic / Sports MVP", description: "Standout athlete dominating on the court, track, or field.", iconName: "Trophy" },
  { id: "quiet_achiever", title: "The Quiet Achiever", description: "Low-key genius producing incredible results behind the scenes.", iconName: "Feather" },
  { id: "world_traveler", title: "Most Likely to Travel the World", description: "Adventurer with endless wanderlust ready to explore new continents.", iconName: "Globe" },
  { id: "unsung_hero", title: "Unsung Hero", description: "Reliable, dependable friend always ready to lend a helping hand.", iconName: "HeartHandshake" }
];

export interface UserSession {
  id: string;
  fullName: string;
  role: 'admin' | 'student';
  examNumber?: string;
  email?: string;
}

export function generateInitialsAvatar(fullName: string): string {
  const name = fullName ? fullName.trim() : 'Student';
  const parts = name.split(/\s+/);
  let initials = '';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'GS';
  }

  // Deterministic color palette selection from student name hash
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorPalettes = [
    { bg: '#047857', fg: '#ffffff' }, // emerald-700
    { bg: '#0f766e', fg: '#ffffff' }, // teal-700
    { bg: '#0369a1', fg: '#ffffff' }, // sky-700
    { bg: '#1d4ed8', fg: '#ffffff' }, // blue-700
    { bg: '#4338ca', fg: '#ffffff' }, // indigo-700
    { bg: '#6d28d9', fg: '#ffffff' }, // violet-700
    { bg: '#be185d', fg: '#ffffff' }, // pink-700
    { bg: '#c2410c', fg: '#ffffff' }, // orange-700
    { bg: '#15803d', fg: '#ffffff' }, // green-700
    { bg: '#0891b2', fg: '#ffffff' }, // cyan-700
  ];
  const theme = colorPalettes[nameHash % colorPalettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <rect width="128" height="128" fill="${theme.bg}" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${theme.fg}" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="44" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getStudentPhotoUrl(photoFilename?: string): string {
  if (!photoFilename) return generateInitialsAvatar('Student');
  if (photoFilename.startsWith('data:') || photoFilename.startsWith('http://') || photoFilename.startsWith('https://')) {
    return photoFilename;
  }
  let clean = photoFilename.startsWith('/') ? photoFilename.slice(1) : photoFilename;
  if (clean.startsWith('photos/')) {
    clean = clean.replace(/^photos\//, '');
  }
  const nameWithoutExt = clean.replace(/\.(jpe?g|png|webp|jfif|gif|svg)$/i, '');
  const fileName = nameWithoutExt || clean;

  const baseUrl = import.meta.env.BASE_URL || './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}photos/${fileName}.webp`;
}

export function handleStudentImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fullName: string): void {
  const target = e.currentTarget;
  const currentSrc = target.src || '';
  const tried = target.dataset.fallbackTried;

  if (currentSrc.startsWith('data:')) {
    target.onerror = null;
    target.src = generateInitialsAvatar(fullName);
    return;
  }

  if (!tried) {
    if (currentSrc.endsWith('.webp') && !currentSrc.includes('-1.webp')) {
      target.dataset.fallbackTried = 'dash1';
      target.src = currentSrc.replace(/\.webp$/i, '-1.webp');
      return;
    }
    if (currentSrc.endsWith('.webp')) {
      target.dataset.fallbackTried = 'jpg';
      target.src = currentSrc.replace(/\.webp$/i, '.jpg');
      return;
    }
    if (currentSrc.endsWith('.jpg') || currentSrc.endsWith('.jpeg')) {
      target.dataset.fallbackTried = 'png';
      target.src = currentSrc.replace(/\.(jpg|jpeg)$/i, '.png');
      return;
    }
  } else if (tried === 'dash1') {
    target.dataset.fallbackTried = 'jpg';
    target.src = currentSrc.replace(/-1\.webp$/i, '.jpg');
    return;
  } else if (tried === 'jpg') {
    target.dataset.fallbackTried = 'png';
    target.src = currentSrc.replace(/\.jpg$/i, '.png');
    return;
  }

  target.onerror = null;
  target.src = generateInitialsAvatar(fullName);
}

export function handleLogoImageError(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = e.currentTarget;
  target.onerror = null;
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <rect width="128" height="128" fill="#065f46" rx="16" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="32">GSS</text>
  </svg>`;
  target.src = `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg)}`;
}
