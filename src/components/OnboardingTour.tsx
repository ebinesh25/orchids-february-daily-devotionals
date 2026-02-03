"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ONBOARDING_STORAGE_KEY = "hasSeenOnboarding";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: "bottom" | "top" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    targetId: "language-button",
    title: "Switch Language",
    description: "Toggle between English and Tamil translations of the devotional.",
    position: "bottom",
  },
  {
    targetId: "font-button",
    title: "Font Size",
    description: "Adjust the text size for comfortable reading - from small to extra large.",
    position: "bottom",
  },
  {
    targetId: "theme-button",
    title: "Theme Toggle",
    description: "Switch between light and dark themes based on your preference.",
    position: "bottom",
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownPositionRef = useRef({ top: 0, left: 0, width: 0, height: 0 });

  const hasSeenOnboarding = typeof window !== "undefined"
    ? localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true"
    : false;

  useEffect(() => {
    if (!hasSeenOnboarding) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;

    const targetId = tourSteps[currentStep]?.targetId;
    if (!targetId) return;

    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }

    // For font button, also check if dropdown is open and get its position
    if (targetId === "font-button") {
      // Find the dropdown menu content using data-state attribute
      const dropdownContent = document.querySelector('[data-state="open"][role="menu"]');
      if (dropdownContent) {
        const rect = dropdownContent.getBoundingClientRect();
        dropdownPositionRef.current = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
        setIsDropdownOpen(true);
      } else {
        setIsDropdownOpen(false);
      }
    } else {
      setIsDropdownOpen(false);
    }
  }, [isOpen, currentStep]);

  // Watch for dropdown open/close using MutationObserver
  useEffect(() => {
    if (!isOpen || currentStep !== 1) return;

    const observer = new MutationObserver(() => {
      updateTargetPosition();
    });

    // Observe the body for changes in the dropdown
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'class'],
    });

    return () => observer.disconnect();
  }, [isOpen, currentStep, updateTargetPosition]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);
    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen || hasSeenOnboarding) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const isFontStep = currentStep === 1;

  // Calculate tooltip position based on whether dropdown is open
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 99999,
  };

  if (isFontStep && isDropdownOpen) {
    // Position to the left of the dropdown
    const dropdownPos = dropdownPositionRef.current;
    tooltipStyle = {
      ...tooltipStyle,
      top: dropdownPos.top + dropdownPos.height / 2,
      left: dropdownPos.left - 340, // tooltip width (320) + padding
      transform: "translateY(-50%)",
    };
  } else {
    // Default position below the button
    tooltipStyle = {
      ...tooltipStyle,
      top: targetPosition.top + targetPosition.height + 12,
      left: targetPosition.left + targetPosition.width / 2,
      transform: "translateX(-50%)",
    };
  }

  // Update spotlight to highlight dropdown when open
  let spotlightStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 99998,
    transition: "all 0.3s ease",
    borderRadius: "8px",
    boxShadow: "0 0 0 4px hsl(var(--primary)), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
  };

  if (isFontStep && isDropdownOpen) {
    const dropdownPos = dropdownPositionRef.current;
    spotlightStyle = {
      ...spotlightStyle,
      top: dropdownPos.top - 4,
      left: dropdownPos.left - 4,
      width: dropdownPos.width + 8,
      height: dropdownPos.height + 8,
    };
  } else {
    spotlightStyle = {
      ...spotlightStyle,
      top: targetPosition.top - 4,
      left: targetPosition.left - 4,
      width: targetPosition.width + 8,
      height: targetPosition.height + 8,
    };
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 99997 }}
        onClick={handleSkip}
      />

      {/* Spotlight */}
      <div style={spotlightStyle} />

      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className="w-80 animate-in fade-in duration-300"
      >
        <div className="bg-popover text-popover-foreground rounded-lg border shadow-lg p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm">
                {currentStepData.title}
                <span className="text-muted-foreground ml-2">
                  {currentStep + 1}/{tourSteps.length}
                </span>
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {currentStepData.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Skip button */}
            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleSkip}
              >
                Skip tour
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8"
                onClick={handleNext}
              >
                {isLastStep ? "Got it!" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : "w-1 bg-muted"
                )}
              />
            ))}
          </div>
        </div>
        {/* Arrow */}
        {!isDropdownOpen && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-popover border-l border-t transform rotate-45" />
        )}
        {isDropdownOpen && (
          <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-popover border-t border-r transform rotate-45" />
        )}
      </div>
    </>
  );
}
