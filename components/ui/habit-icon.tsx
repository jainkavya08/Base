import { 
  Activity, Heart, Star, Zap, Target, Book, Droplets, Moon, 
  Laptop, Dumbbell, Coffee, Music, Sun, Cloud, PenTool, 
  CheckCircle, Flame, Battery, Camera, Compass, Map, 
  Briefcase, Code, Terminal, Infinity, Sparkles, Feather, 
  Key, Shield, Layers, Flag, Award, Crown, Lightbulb, 
  Rocket, Sprout, Flower2, Mountain, Anchor, Tent, Car, 
  Plane, Bike, Smile, Umbrella, Scissors, Bell, Clock,
  Trophy, TrendingUp, Palette, Pen, Gamepad, Headphones,
  Camera as CameraIcon, Video, Mic, Smartphone, Watch
} from "lucide-react";

export const LUCIDE_ICONS: Record<string, React.ElementType> = {
  Activity, Heart, Star, Zap, Target, Book, Droplets, Moon, 
  Laptop, Dumbbell, Coffee, Music, Sun, Cloud, PenTool, 
  CheckCircle, Flame, Battery, Camera, Compass, Map, 
  Briefcase, Code, Terminal, Infinity, Sparkles, Feather, 
  Key, Shield, Layers, Flag, Award, Crown, Lightbulb, 
  Rocket, Sprout, Flower2, Mountain, Anchor, Tent, Car, 
  Plane, Bike, Smile, Umbrella, Scissors, Bell, Clock,
  Trophy, TrendingUp, Palette, Pen, Gamepad, Headphones,
  Video, Mic, Smartphone, Watch
};

export function HabitIcon({ icon, className }: { icon?: string, className?: string }) {
  if (!icon) return <span className={className}>✨</span>;
  
  if (icon.startsWith("lucide:")) {
    const Icon = LUCIDE_ICONS[icon.replace("lucide:", "")];
    if (Icon) return <Icon className={className} />;
    return <span className={className}>✨</span>;
  }
  
  // Emojis shouldn't typically have stroke/fill classes applied via className directly 
  // as it doesn't affect them like SVGs, but we still apply className for sizing.
  return <span className={className}>{icon}</span>;
}
