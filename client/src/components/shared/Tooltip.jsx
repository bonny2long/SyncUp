import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 300,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-surface-highlight",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-surface-highlight",
    left: "left-full top-1/2 -translate-y-1/2 border-l-surface-highlight",
    right: "right-full top-1/2 -translate-y-1/2 border-r-surface-highlight",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm bg-surface-highlight text-neutral-dark rounded-lg shadow-lg whitespace-nowrap max-w-xs ${positionClasses[position]} animate-in fade-in zoom-in-95 duration-150`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]} `}
          />
        </div>
      )}
    </div>
  );
}

export function InfoTooltip({ content, className = "" }) {
  return (
    <Tooltip content={content} position="top">
      <HelpCircle className={`w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help ${className}`} />
    </Tooltip>
  );
}
