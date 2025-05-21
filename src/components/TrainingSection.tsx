import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  // Change the type to NodeJS.Timeout | null to match what setInterval returns
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for existing tuneId in localStorage
    const storedTuneId = localStorage.getItem('currentTuneId');
    if (storedTuneId) {
      setTuneId(storedTuneId);
      checkTrainingStatus(storedTuneId);
    }

    // Clean up polling interval on unmount
    return () => {
      if (pollingInterval !== null) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const startTraining = async () => {
    if (imageIds.length === 0) {
      setError("No images available for training");
      toast.error("No images available for training");
      return;
    }

    if (imageIds.length < 10) {
      setError("At least 10 images are required for training");
      toast.error("At least 10 images are required for training");
      return;
    }

    setError(null);
    setIsTraining(true);
    setProgress(0);
    setStatus('training');
    setStatusMessage('Initializing AI model training...');
    
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
      toast.success("AI model training started successfully");
      setStatusMessage('Training your AI model...');
      
      // Start polling for status
      const interval = setInterval(async () => {
        const status = await checkTrainingStatus(newTuneId);
        
        if (status === 'complete') {
          clearInterval(interval);
          setPollingInterval(null);
          onTrainingComplete(newTuneId);
        }
        
        // Update progress based on status
        if (status === 'training') {
          // Increment progress slightly to show activity
          setProgress((prev) => {
            const newProgress = Math.min(prev + 2, 95);
            return newProgress;
          });
          
          // Update status message
          if (progress < 30) {
            setStatusMessage('Analyzing facial features...');
          } else if (progress < 60) {
            setStatusMessage('Learning your unique characteristics...');
          } else {
            setStatusMessage('Finalizing your AI model...');
          }
        } else if (status === 'complete') {
          setProgress(100);
          setStatusMessage('Training complete!');
        } else if (status === 'error') {
          clearInterval(interval);
          setPollingInterval(null);
          setStatusMessage('Training failed. Please try again.');
          setError('There was an error during training.');
          toast.error('Training failed. Please try again.');
        }
      }, 15000); // Poll every 15 seconds
      
      setPollingInterval(interval);
    } catch (error: any) {
      console.error("Training error:", error);
      setError(`Error during training: ${error.message}`);
      toast.error(`Error during training: ${error.message}`);
      setStatus('error');
      setStatusMessage('There was an error during training.');
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
          setStatusMessage('Training complete!');
          toast.success("Training completed successfully!");
          
          // Clean up polling interval
          if (pollingInterval !== null) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (data.status === 'error' || data.status === 'failed') {
          setError('Training failed. Please try again with different images.');
          setStatusMessage('Training failed.');
          
          // Clean up polling interval
          if (pollingInterval !== null) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
        
        return data.status;
      }
      
      return 'pending';
    } catch (error: any) {
      console.error("Status check error:", error);
      setError(`Error checking training status: ${error.message}`);
      return 'error';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2">
        <CardContent className="pt-6 flex flex-col items-center">
          <h3 className="text-xl font-medium text-center mb-6">Train Your Custom AI Model</h3>
          
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {!tuneId && (
            <>
              <div className="w-full p-6 bg-muted/50 rounded-lg mb-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">AI Training Process</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll now use your photos to create a personalized AI model that captures your features.
                      This process typically takes 10-15 minutes.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={startTraining}
                disabled={isTraining || imageIds.length < 10}
                className="w-full mb-4 bg-brand-600 hover:bg-brand-700"
                size="lg"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Training in Progress...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Training
                  </>
                )}
              </Button>
            </>
          )}
          
          {(isTraining || tuneId) && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Training Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="mb-4" />
              
              <div className="text-center py-2 px-4 rounded-md bg-muted/50 mb-4">
                <p className="text-sm">{statusMessage}</p>
              </div>
              
              {status === 'complete' && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-3 mb-4">
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
            Continue to Style Selection <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSection;
