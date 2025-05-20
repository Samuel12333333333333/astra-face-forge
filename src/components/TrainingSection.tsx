
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
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
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("waiting");
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Start training
  const handleStartTraining = async () => {
    setIsTraining(true);
    setProgress(5);
    
    try {
      // Get the auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Create tune
      const response = await fetch('/api/astria/create-tune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageIds: imageIds,
          callbackUrl: window.location.origin + '/api/webhook/astria-callback'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to start training: ${errorText}`);
      }
      
      const result = await response.json();
      setTuneId(result.id);
      setStatus("training");
      setProgress(15);
      toast.success("Training started successfully!");
      
      // Set up interval to check status
      const interval = setInterval(checkTrainingStatus, 10000); // Check every 10 seconds
      setStatusCheckInterval(interval);
    } catch (error: any) {
      console.error("Training error:", error);
      toast.error(`Error starting training: ${error.message}`);
      setIsTraining(false);
    }
  };

  // Check training status
  const checkTrainingStatus = async () => {
    try {
      // Get the auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch('/api/astria/check-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to check training status: ${errorText}`);
      }
      
      const result = await response.json();
      setStatus(result.status);
      
      // Update progress based on status
      if (result.status === "training") {
        setProgress(prev => Math.min(prev + 5, 70)); // Slowly increase progress while training
      } else if (result.status === "completed") {
        setProgress(100);
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        onTrainingComplete(result.id);
        toast.success("Training completed successfully!");
      } else if (result.status === "failed") {
        setProgress(0);
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        toast.error("Training failed. Please try again.");
        setIsTraining(false);
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <h3 className="text-xl font-medium text-center mb-6">Train AI Model</h3>
          
          <div className="w-full mb-6">
            {!isTraining ? (
              <div className="text-center">
                <p className="mb-4">Ready to create your personalized AI model</p>
                <Button onClick={handleStartTraining}>Start Training</Button>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Training Progress</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground capitalize">
                    Status: {status === "completed" ? "Complete" : status}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {status === "waiting" && "Preparing your images..."}
                    {status === "training" && "Training the AI with your photos. This may take a few minutes..."}
                    {status === "completed" && "Training complete! Ready to generate headshots."}
                    {status === "failed" && "Training failed. Please try again."}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full"
            onClick={onContinue}
            disabled={status !== "completed"}
          >
            Continue to Generate Headshots <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSection;
