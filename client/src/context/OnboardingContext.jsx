import React, { createContext, useContext, useState, useEffect } from "react";

const OnboardingContext = createContext(null);

const ONBOARDING_KEY = "syncup_onboarding_complete";
const ONBOARDING_STEPS_KEY = "syncup_onboarding_steps";

export function OnboardingProvider({ children }) {
  const [isComplete, setIsComplete] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    const storedSteps = localStorage.getItem(ONBOARDING_STEPS_KEY);
    
    if (stored === "true") {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
    
    if (storedSteps) {
      try {
        const steps = JSON.parse(storedSteps);
        if (steps.length === 0) {
          setIsComplete(true);
        }
      } catch {
        setIsComplete(false);
      }
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(ONBOARDING_STEPS_KEY, JSON.stringify([]));
    setIsComplete(true);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    completeOnboarding();
    setIsSkipped(true);
  };

  const nextStep = () => {
    const steps = getOnboardingSteps();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isComplete,
        currentStep,
        isSkipped,
        completeOnboarding,
        skipOnboarding,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    return {
      isComplete: true,
      currentStep: 0,
      skipOnboarding: () => {},
      nextStep: () => {},
      prevStep: () => {},
    };
  }
  return context;
}

export function getOnboardingSteps() {
  return [
    {
      target: "sidebar",
      title: "Welcome to SyncUp!",
      content: "Use the sidebar to navigate between Collaboration Hub, Mentorship Bridge, Skill Tracker, and more.",
      position: "right",
    },
    {
      target: "profile",
      title: "Your Profile",
      content: "Click your avatar to view and edit your profile, export your data, or change settings.",
      position: "bottom",
    },
    {
      target: "projects",
      title: "Find Projects",
      content: "Browse and join projects that match your interests. Collaborate with team members and build your portfolio.",
      position: "right",
    },
    {
      title: "Get Help Anytime",
      content: "Need assistance? Click Help & Support in the menu to access FAQs and contact support.",
      position: "left",
    },
  ];
}
