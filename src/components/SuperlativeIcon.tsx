import React from 'react';
import { getStudentPhotoUrl } from '../types';

const CATEGORY_STUDENT_IMAGES: Record<string, string> = {
  Laptop: "1.webp",
  Palette: "2.webp",
  BookOpen: "3.webp",
  Crown: "4.webp",
  Smile: "5.webp",
  Briefcase: "6.webp",
  Shirt: "7.webp",
  Laugh: "8.webp",
  Trophy: "9.webp",
  Feather: "10.webp",
  Globe: "11.webp",
  HeartHandshake: "12.webp",
};

interface SuperlativeIconProps {
  name: string;
  className?: string;
}

export const SuperlativeIcon: React.FC<SuperlativeIconProps> = ({ name, className = "w-5 h-5" }) => {
  const photoName = CATEGORY_STUDENT_IMAGES[name] || "1.webp";
  const imageUrl = getStudentPhotoUrl(photoName);
  return (
    <img
      src={imageUrl}
      alt={name}
      className={`${className} object-cover rounded-md border border-emerald-800/80 shrink-0 shadow-sm`}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src.endsWith('.webp')) {
          target.src = target.src.replace(/\.webp$/, '.jpg');
        } else {
          const baseUrl = import.meta.env.BASE_URL || './';
          const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
          target.src = `${prefix}photos/gsskubwalogo.jpg`;
        }
      }}
    />
  );
};

