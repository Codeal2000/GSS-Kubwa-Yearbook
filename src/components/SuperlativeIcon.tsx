import React from 'react';

const CATEGORY_STUDENT_IMAGES: Record<string, string> = {
  Laptop: "/photos/1.webp",
  Palette: "/photos/2.webp",
  BookOpen: "/photos/3.webp",
  Crown: "/photos/4.webp",
  Smile: "/photos/5.webp",
  Briefcase: "/photos/6.webp",
  Shirt: "/photos/7.webp",
  Laugh: "/photos/8.webp",
  Trophy: "/photos/9.webp",
  Feather: "/photos/10.webp",
  Globe: "/photos/11.webp",
  HeartHandshake: "/photos/12.webp",
};

interface SuperlativeIconProps {
  name: string;
  className?: string;
}

export const SuperlativeIcon: React.FC<SuperlativeIconProps> = ({ name, className = "w-5 h-5" }) => {
  const imageUrl = CATEGORY_STUDENT_IMAGES[name] || "/photos/1.webp";
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
          target.src = '/photos/gsskubwalogo.jpg';
        }
      }}
    />
  );
};

