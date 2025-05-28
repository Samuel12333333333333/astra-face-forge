
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  isLoading?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  isLoading = false
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </div>
      
      <Button
        onClick={onForward}
        disabled={!canGoForward || isLoading}
        className="flex items-center gap-2"
      >
        {currentStep === totalSteps ? 'Finish' : 'Continue'}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
