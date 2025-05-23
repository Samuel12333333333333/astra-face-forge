
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface EmptyHeadshotStateProps {
  onGenerate: () => void;
  isGenerating: boolean;
  hasTuneId: boolean;
}

const EmptyHeadshotState: React.FC<EmptyHeadshotStateProps> = ({
  onGenerate,
  isGenerating,
  hasTuneId
}) => {
  return (
    <div className="h-64 w-full flex flex-col items-center justify-center text-center p-4 rounded-lg bg-muted/50">
      <p className="text-muted-foreground mb-4">No headshots have been generated yet.</p>
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating || !hasTuneId}
        className="bg-brand-600 hover:bg-brand-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Headshots
          </>
        )}
      </Button>
    </div>
  );
};

export default EmptyHeadshotState;
