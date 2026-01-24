/**
 * Task 97 + Task 101: Progress Timeline Component
 * A beautiful visual timeline showing 8 stages of package creation progress
 */

import { 
  type CreationStage, 
  ORDERED_STAGES, 
  STAGE_LABELS, 
  STAGE_ICONS, 
  STAGE_MESSAGES,
  STAGE_PERCENTAGES 
} from "../lib/access-control";

interface TimelineProps {
  currentStage: CreationStage;
  variant?: "horizontal" | "vertical";
  showLabels?: boolean;
  showMessages?: boolean;
  compact?: boolean;
  timestamps?: Record<string, string>;
}

export const ProgressTimeline = ({ 
  currentStage, 
  variant = "horizontal",
  showLabels = true,
  showMessages = true,
  compact = false,
  timestamps
}: TimelineProps) => {
  const currentIndex = ORDERED_STAGES.indexOf(currentStage);
  const percentage = STAGE_PERCENTAGES[currentStage];

  if (variant === "vertical") {
    return (
      <div className="space-y-0">
        {ORDERED_STAGES.map((stage, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const icon = STAGE_ICONS[stage];
          const label = STAGE_LABELS[stage];
          const message = STAGE_MESSAGES[stage];
          const timestamp = timestamps?.[stage];

          return (
            <div key={stage} className="flex items-start gap-4">
              {/* Circle and line */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300 border-2
                  ${isPast ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                  ${isCurrent ? "bg-orange-500 border-orange-500 text-white animate-pulse shadow-lg shadow-orange-500/50" : ""}
                  ${isFuture ? "bg-white/5 border-white/20 text-gray-500" : ""}
                `}>
                  {isPast ? "✓" : icon}
                </div>
                {index < ORDERED_STAGES.length - 1 && (
                  <div className={`w-0.5 h-12 transition-all duration-300 ${
                    isPast ? "bg-emerald-500" : "bg-white/10"
                  }`} />
                )}
              </div>
              
              {/* Content */}
              <div className={`pb-8 ${compact ? "" : "pt-1"}`}>
                {showLabels && (
                  <h4 className={`font-semibold transition-colors ${
                    isPast ? "text-emerald-400" : 
                    isCurrent ? "text-orange-400" : 
                    "text-gray-500"
                  }`}>
                    {label}
                  </h4>
                )}
                {showMessages && isCurrent && (
                  <p className="text-sm text-gray-400 mt-1">{message}</p>
                )}
                {timestamp && (
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(timestamp).toLocaleDateString("pt-BR", { 
                      day: "2-digit", 
                      month: "2-digit", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className="w-full">
      {/* Progress bar background */}
      <div className="relative">
        {/* Track */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-white/10 rounded-full" />
        
        {/* Filled track */}
        <div 
          className="absolute top-4 left-0 h-1 bg-gradient-to-r from-emerald-500 via-orange-500 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(5, percentage)}%` }}
        />
        
        {/* Stages */}
        <div className="relative flex justify-between">
          {ORDERED_STAGES.map((stage, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;
            const icon = STAGE_ICONS[stage];
            const label = STAGE_LABELS[stage];

            return (
              <div 
                key={stage} 
                className="flex flex-col items-center"
                style={{ width: compact ? "auto" : `${100 / ORDERED_STAGES.length}%` }}
              >
                {/* Circle */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  transition-all duration-300 border-2 z-10 bg-[#0a0f1a]
                  ${isPast ? "border-emerald-500 text-emerald-400" : ""}
                  ${isCurrent ? "border-orange-500 text-orange-400 animate-pulse shadow-lg shadow-orange-500/30 scale-125" : ""}
                  ${isFuture ? "border-white/20 text-gray-600" : ""}
                `}>
                  {isPast ? "✓" : icon}
                </div>
                
                {/* Label - only show for current and nearby stages on compact mode */}
                {showLabels && (
                  <span className={`
                    text-[10px] mt-2 text-center leading-tight max-w-16
                    transition-colors
                    ${compact ? "hidden md:block" : ""}
                    ${isPast ? "text-emerald-400/70" : ""}
                    ${isCurrent ? "text-orange-400 font-bold" : ""}
                    ${isFuture ? "text-gray-600" : ""}
                  `}>
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current stage message */}
      {showMessages && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <span className="text-xl">{STAGE_ICONS[currentStage]}</span>
            <span className="text-orange-400 font-medium">{STAGE_MESSAGES[currentStage]}</span>
          </div>
          <div className="mt-2 text-gray-500 text-sm">
            {percentage}% concluído
          </div>
        </div>
      )}
    </div>
  );
};

// Mini timeline for cards/badges
export const MiniTimeline = ({ currentStage }: { currentStage: CreationStage }) => {
  const currentIndex = ORDERED_STAGES.indexOf(currentStage);
  const percentage = STAGE_PERCENTAGES[currentStage];

  return (
    <div className="flex items-center gap-2">
      {/* Mini progress dots */}
      <div className="flex gap-1">
        {ORDERED_STAGES.map((stage, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div
              key={stage}
              className={`w-2 h-2 rounded-full transition-all ${
                isPast ? "bg-emerald-500" :
                isCurrent ? "bg-orange-500 animate-pulse" :
                "bg-white/20"
              }`}
            />
          );
        })}
      </div>
      
      {/* Percentage */}
      <span className="text-xs text-gray-400">{percentage}%</span>
    </div>
  );
};

export default ProgressTimeline;
