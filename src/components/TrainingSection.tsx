import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TrainingStatusCard from "./TrainingStatusCard";

interface TrainingSectionProps {
  images: File[];
  onTrainingComplete: (tuneId: string) => void;
  onContinue: () => void;
}

const TrainingSection: React.FC<TrainingSectionProps> = ({
  images,
  onTrainingComplete,
  onContinue
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'creating-tune' | 'training' | 'completed' | 'error'>('idle');
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Debug: Log images on mount
  useEffect(() => {
    console.log("TrainingSection mounted with images:", images.length, images.map(f => f.name));
  }, [images]);

  // Update estimated time remaining
  useEffect(() => {
    if (status === 'training' && startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime.getTime();
        const estimatedTotal = 25 * 60 * 1000; // 25 minutes average
        const remaining = Math.max(0, estimatedTotal - elapsed);
        setEstimatedTimeRemaining(remaining);
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  const startTraining = async () => {
    console.log("Starting training with", images.length, "images");
    
    if (images.length === 0) {
      const errorMsg = "No images provided for training";
      console.error(errorMsg);
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsTraining(true);
    setProgress(0);
    setError(null);
    setStatus('creating-tune');
    const trainingStartTime = new Date();
    setStartTime(trainingStartTime);

    // Store session info
    localStorage.setItem('trainingStartTime', trainingStartTime.toISOString());
    localStorage.setItem('trainingStatus', 'creating-tune');

    try {
      // Show upfront expectations
      toast.info("Starting AI model training - this will take 20-30 minutes for the best quality results");

      console.log("Converting images to base64...");
      setProgress(10);

      // Convert all images to base64
      const base64Images: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        console.log(`Converting image ${i+1}/${images.length}: ${file.name} (${file.size} bytes)`);
        
        try {
          const base64Data = await fileToBase64(file);
          base64Images.push(base64Data);
          console.log(`Converted ${file.name} to base64`);
        } catch (conversionError: any) {
          console.error(`Error converting image ${i+1}:`, conversionError);
          toast.warning(`Could not process image ${i+1}: ${file.name}`);
          // Continue with other images
        }

        // Update progress for image conversion
        const conversionProgress = 10 + ((i + 1) / images.length) * 20; // 10-30%
        setProgress(conversionProgress);
      }

      if (base64Images.length === 0) {
        throw new Error("Failed to convert any images to base64");
      }

      console.log(`Successfully converted ${base64Images.length} images. Creating tune with images...`);
      setProgress(30);

      // Create tune with all images in one request - FIXED ACTION NAME
      const { data: tuneData, error: tuneError } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune-with-images', // Fixed: was 'create-tune'
          images: base64Images
        }
      });

      if (tuneError) {
        console.error("Tune creation error:", tuneError);
        throw new Error(`Failed to create tune: ${tuneError.message}`);
      }
      
      if (!tuneData || !tuneData.id) {
        console.error("No tune data received:", tuneData);
        throw new Error("No tune ID received from creation");
      }

      const createdTuneId = tuneData.id;
      console.log("Tune created successfully with ID:", createdTuneId);
      
      setTuneId(createdTuneId);
      setStatus('training');
      setProgress(50);

      // Store tune ID for persistence
      localStorage.setItem('currentTuneId', createdTuneId);
      localStorage.setItem('trainingStatus', 'training');

      // Show training started message
      toast.success(`Training started with ${base64Images.length} images. We'll email you when it's ready!`);

      // Poll for training completion
      await pollTrainingStatus(createdTuneId);

    } catch (error: any) {
      console.error("Training error:", error);
      setError(error.message);
      setStatus('error');
      localStorage.setItem('trainingStatus', 'error');
      toast.error(`Training failed: ${error.message}`);
      setIsTraining(false);
    }
  };

  const pollTrainingStatus = async (tuneId: string) => {
    const maxAttempts = 120; // 40 minutes max (30 second intervals)
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.functions.invoke('astria', {
          body: {
            action: 'check-status',
            tuneId: tuneId
          }
        });

        if (error) {
          console.error("Status check error:", error);
          throw new Error(`Status check failed: ${error.message}`);
        }

        const currentStatus = data?.status || 'unknown';
        console.log(`Training status: ${currentStatus} (attempt ${attempts + 1})`);

        if (currentStatus === 'training' || currentStatus === 'queued' || currentStatus === 'processing') {
          const progressValue = 50 + (attempts / maxAttempts) * 40; // 50-90%
          setProgress(Math.min(progressValue, 90));
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 30000); // Check every 30 seconds
          } else {
            throw new Error("Training is taking longer than expected. We'll email you when it's ready.");
          }
        } else if (currentStatus === 'finished' || currentStatus === 'completed') {
          setProgress(100);
          setStatus('completed');
          localStorage.setItem('trainingStatus', 'completed');
          setIsTraining(false);
          
          // Send email notification
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
              await supabase.functions.invoke('send-training-notification', {
                body: {
                  email: user.email,
                  tuneId: tuneId,
                  userName: user.user_metadata?.first_name
                }
              });
            }
          } catch (emailError) {
            console.warn("Could not send email notification:", emailError);
          }

          onTrainingComplete(tuneId);
          toast.success("🎉 Training completed! Your AI model is ready to create professional headshots.");
        } else if (currentStatus === 'failed' || currentStatus === 'error') {
          throw new Error("Training failed on Astria's servers. Please try again with different photos.");
        } else {
          // Unknown status, continue polling
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 30000);
          } else {
            throw new Error("Training status unclear. We'll email you when it's ready.");
          }
        }
      } catch (error: any) {
        console.error("Status check error:", error);
        setError(error.message);
        setStatus('error');
        setIsTraining(false);
        localStorage.setItem('trainingStatus', 'error');
        throw error;
      }
    };

    await checkStatus();
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleRetry = () => {
    // Clear stored session
    localStorage.removeItem('currentTuneId');
    localStorage.removeItem('trainingStatus');
    localStorage.removeItem('trainingStartTime');
    
    // Reset state
    setStatus('idle');
    setProgress(0);
    setError(null);
    setTuneId(null);
    setIsTraining(false);
    setStartTime(null);
    setEstimatedTimeRemaining(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <TrainingStatusCard 
        status={status}
        progress={progress}
        error={error}
        estimatedTimeRemaining={estimatedTimeRemaining}
      />

      <div className="mt-6 space-y-3">
        <Button
          onClick={startTraining}
          disabled={isTraining || status === 'completed' || images.length === 0}
          className="w-full bg-brand-600 hover:bg-brand-700"
          size="lg"
        >
          {isTraining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Training in Progress...
            </>
          ) : status === 'completed' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Training Completed
            </>
          ) : images.length === 0 ? (
            "No Images to Train With"
          ) : (
            `Start AI Training with ${images.length} Images (20-30 min)`
          )}
        </Button>

        {status === 'error' && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}

        <Button
          onClick={onContinue}
          disabled={status !== 'completed'}
          variant={status === 'completed' ? "default" : "outline"}
          className="w-full"
          size="lg"
        >
          Continue to Style Selection <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {status === 'training' && (
        <div className="mt-6 text-center text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-900 mb-1">💡 Pro Tip</p>
          <p className="text-blue-700">
            Bookmark this page or keep the tab open. We'll also email you when your model is ready 
            so you can come back anytime to generate your headshots.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainingSection;
