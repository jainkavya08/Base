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
  if (!icon) return <Sparkles className={className} />;
  
  const cleanName = icon.replace("lucide:", "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const foundKey = Object.keys(LUCIDE_ICONS).find(k => k.toLowerCase() === cleanName);
  
  if (foundKey && LUCIDE_ICONS[foundKey]) {
    const Icon = LUCIDE_ICONS[foundKey];
    return <Icon className={className} />;
  }

  // If it's a short emoji
  if (icon.length <= 4) {
    return <span className={className}>{icon}</span>;
  }
  
  return <Sparkles className={className} />;
}
