
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TrainingSectionProps {
  imageIds: string[];
  onTrainingComplete: (tuneId: string) => void;
  onContinue: () => void;
}

const TrainingSection: React.FC<TrainingSectionProps> = ({ 
  imageIds, 
  onTrainingComplete, 
  onContinue 
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');

  useEffect(() => {
    // Check for existing tuneId in localStorage
    const storedTuneId = localStorage.getItem('currentTuneId');
    if (storedTuneId) {
      setTuneId(storedTuneId);
      checkTrainingStatus(storedTuneId);
    }
  }, []);

  const startTraining = async () => {
    if (imageIds.length === 0) {
      toast.error("No images available for training");
      return;
    }

    setIsTraining(true);
    setProgress(0);
    setStatus('training');
    
    try {
      // Call the Supabase Edge Function to create a tune
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune',
          imageIds: imageIds
        }
      });
      
      if (error) {
        throw new Error(`Error creating tune: ${error.message}`);
      }
      
      if (!data || !data.id) {
        throw new Error("No tune ID received from API");
      }
      
      const newTuneId = data.id;
      setTuneId(newTuneId);
      localStorage.setItem('currentTuneId', newTuneId);
      
      // Start polling for status
      const statusInterval = setInterval(async () => {
        const status = await checkTrainingStatus(newTuneId);
        
        if (status === 'complete') {
          clearInterval(statusInterval);
          onTrainingComplete(newTuneId);
        }
        
        // Update progress based on status
        if (status === 'training') {
          // Increment progress to simulate training progress
          setProgress((prev) => {
            const newProgress = Math.min(prev + 5, 90);
            return newProgress;
          });
        } else if (status === 'complete') {
          setProgress(100);
        }
      }, 3000);
      
    } catch (error: any) {
      console.error("Training error:", error);
      toast.error(`Error during training: ${error.message}`);
      setStatus('error');
    } finally {
      setIsTraining(false);
    }
  };
  
  const checkTrainingStatus = async (id: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'check-status',
          tuneId: id
        }
      });
      
      if (error) {
        throw new Error(`Error checking tune status: ${error.message}`);
      }
      
      if (data && data.status) {
        console.log("Tune status:", data.status);
        setStatus(data.status);
        
        if (data.status === 'complete') {
          setProgress(100);
          toast.success("Training completed successfully!");
        }
        
        return data.status;
      }
      
      return 'pending';
    } catch (error) {
      console.error("Status check error:", error);
      return 'error';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <h3 className="text-xl font-medium text-center mb-6">Train Your Custom AI Model</h3>
          
          {!tuneId && (
            <>
              <p className="text-center text-muted-foreground mb-6">
                We'll now use your photos to create a personalized AI model that captures your features.
                This process typically takes 10-15 minutes.
              </p>
              
              <Button
                onClick={startTraining}
                disabled={isTraining || imageIds.length === 0}
                className="w-full mb-4"
                size="lg"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Training in Progress...
                  </>
                ) : (
                  "Start Training"
                )}
              </Button>
            </>
          )}
          
          {(isTraining || tuneId) && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Training Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {status === 'complete' && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-2 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2">Training Complete!</h4>
                  <p className="text-muted-foreground mb-4">
                    Your AI model is ready to create professional headshots.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Button 
            className="w-full mt-4"
            disabled={!tuneId || status !== 'complete'}
            onClick={onContinue}
            variant={status === 'complete' ? "default" : "outline"}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSection;
