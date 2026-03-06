import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useOnboarding, getOnboardingSteps } from "../../context/OnboardingContext";

export default function OnboardingTour() {
  const { isComplete, currentStep, skipOnboarding, nextStep, prevStep } = useOnboarding();
  const [targetRect, setTargetRect] = useState(null);
  const [stepContent, setStepContent] = useState(null);
  const steps = getOnboardingSteps();

  useEffect(() => {
    if (isComplete) return;

    const step = steps[currentStep];
    setStepContent(step);

    if (step.target) {
      const element = document.querySelector(`[data-onboarding="${step.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isComplete, steps]);

  if (isComplete || !stepContent) return null;

  const getPositionStyle = () => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 12;
    const tooltipWidth = 320;
    const tooltipHeight = 150;

    switch (stepContent.position) {
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - tooltipWidth - padding,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
      default:
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
    }
  };

  return createPortal(
    <>
      {targetRect && (
        <div
          className="fixed z-[55] border-2 border-primary rounded-lg pointer-events-none animate-in fade-in duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div
        className="fixed z-[60] p-5 bg-surface rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200"
        style={getPositionStyle()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={skipOnboarding}
            className="p-1 rounded-full hover:bg-surface-highlight text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-neutral-dark mb-2">{stepContent.title}</h3>
        <p className="text-sm text-text-secondary mb-4">{stepContent.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={skipOnboarding}
            className="text-sm text-text-secondary hover:text-neutral-dark transition-colors"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="p-2 rounded-lg hover:bg-surface-highlight text-text-secondary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
