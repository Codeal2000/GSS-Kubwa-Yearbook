import React from 'react';
import { 
  Laptop, Palette, BookOpen, Sparkles, Smile, Briefcase, 
  Shirt, Laugh, Trophy, Feather, Globe, HeartHandshake, Award
} from 'lucide-react';

interface SuperlativeIconProps {
  name: string;
  className?: string;
}

export const SuperlativeIcon: React.FC<SuperlativeIconProps> = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case 'Laptop': return <Laptop className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Shirt': return <Shirt className={className} />;
    case 'Laugh': return <Laugh className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Feather': return <Feather className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'HeartHandshake': return <HeartHandshake className={className} />;
    default: return <Award className={className} />;
  }
};
