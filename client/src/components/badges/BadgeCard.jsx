import React from "react";
import {
  Footprints,
  FileText,
  Target,
  Hammer,
  Star,
  Palette,
  Flame,
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle,
  Award,
  Zap,
  Trophy,
  Crown,
  Lock,
} from "lucide-react";

const iconMap = {
  Footprints,
  FileText,
  Target,
  Hammer,
  Star,
  Palette,
  Flame,
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle,
  Award,
  Zap,
  Trophy,
  Crown,
  Lock,
};

export default function BadgeCard({ badge, earned = false, showDescription = true }) {
  const IconComponent = iconMap[badge.icon] || Star;

  return (
    <div
      className={`
        relative flex flex-col items-center p-2 rounded-lg border transition-all duration-300
        ${earned 
          ? "border-yellow-400 bg-yellow-50 hover:shadow-md hover:scale-105" 
          : "border-gray-200 bg-gray-50 opacity-50"
        }
      `}
    >
      {!earned && (
        <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-gray-400" />
      )}

      <div
        className={`
          w-8 h-8 flex items-center justify-center rounded-full mb-1
          ${earned ? "bg-yellow-100 text-yellow-600" : "bg-gray-200 text-gray-400"}
        `}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      <p
        className={`
          text-[10px] font-semibold text-center leading-tight
          ${earned ? "text-gray-900" : "text-gray-500"}
        `}
      >
        {badge.name}
      </p>

      {showDescription && earned && (
        <p className="text-[8px] text-gray-500 text-center mt-0.5 px-0.5">
          {badge.description}
        </p>
      )}
    </div>
  );
}
