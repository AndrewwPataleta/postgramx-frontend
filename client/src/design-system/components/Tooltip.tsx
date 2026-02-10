import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
}

export const Tooltip = ({ text, children, className = "" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        className="inline-flex items-center justify-center p-0.5 hover:bg-secondary/50 rounded-full transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onTouchStart={() => setIsVisible(!isVisible)}
      >
        {children || <HelpCircle size={14} className="text-muted-foreground" />}
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground whitespace-nowrap shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary border-r border-b border-border transform rotate-45" />
        </div>
      )}
    </div>
  );
};
