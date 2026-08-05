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
  { id: "most_famous", title: "Most Likely to Become Famous", description: "Future star whose name everyone expects in lights or headlines.", iconName: "Sparkles" },
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

export function getStudentPhotoUrl(photoFilename?: string): string {
  if (!photoFilename) return '/photos/1.png';
  if (photoFilename.startsWith('data:') || photoFilename.startsWith('http://') || photoFilename.startsWith('https://')) {
    return photoFilename;
  }
  const cleanFilename = photoFilename.replace(/\.jpe?g$/i, '.png');
  return `/photos/${cleanFilename}`;
}

export function handleStudentImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fullName: string): void {
  const target = e.currentTarget;
  const currentSrc = target.src;

  if (currentSrc.endsWith('.png')) {
    target.src = currentSrc.replace(/\.png$/, '.jpg');
    return;
  }

  target.onerror = null;
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=ffffff&size=256&bold=true`;
}
