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
        relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300
        ${earned 
          ? "border-yellow-400 bg-yellow-50 hover:shadow-md hover:scale-105" 
          : "border-gray-200 bg-gray-50 opacity-50"
        }
      `}
    >
      {!earned && (
        <Lock className="absolute top-2 right-2 w-3 h-3 text-gray-400" />
      )}

      <div
        className={`
          w-12 h-12 flex items-center justify-center rounded-full mb-2
          ${earned ? "bg-yellow-100 text-yellow-600" : "bg-gray-200 text-gray-400"}
        `}
      >
        <IconComponent className="w-6 h-6" />
      </div>

      <p
        className={`
          text-xs font-semibold text-center
          ${earned ? "text-gray-900" : "text-gray-500"}
        `}
      >
        {badge.name}
      </p>

      {showDescription && (
        <p className="text-[10px] text-gray-500 text-center mt-1 px-1">
          {badge.description}
        </p>
      )}
    </div>
  );
}
