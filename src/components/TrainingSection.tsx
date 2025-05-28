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
  const [status, setStatus] = useState<'idle' | 'creating-tune' | 'uploading-images' | 'training' | 'completed' | 'error'>('idle');
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Check for existing training session on mount with improved validation
  useEffect(() => {
    const validateAndRecoverSession = async () => {
      const storedTuneId = localStorage.getItem('currentTuneId');
      const storedStatus = localStorage.getItem('trainingStatus');
      const storedStartTime = localStorage.getItem('trainingStartTime');
      
      if (!storedTuneId || !storedStatus) {
        console.log("No valid session to recover");
        return;
      }

      // Check if the session is too old (more than 2 hours)
      if (storedStartTime) {
        const startTime = new Date(storedStartTime);
        const now = new Date();
        const hoursSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceStart > 2) {
          console.log("Session is too old, clearing stale data");
          clearStoredSession();
          return;
        }
      }

      // Only recover if status indicates active training
      if (storedStatus === 'training' || storedStatus === 'creating-tune' || storedStatus === 'uploading-images') {
        console.log("Validating existing training session:", storedTuneId);
        
        // Validate the tune still exists and get its current status
        try {
          const { data, error } = await supabase.functions.invoke('astria', {
            body: {
              action: 'check-status',
              tuneId: storedTuneId
            }
          });

          if (error) {
            console.error("Error validating session:", error);
            clearStoredSession();
            return;
          }

          const currentStatus = data?.status;
          console.log("Current tune status from Astria:", currentStatus);

          if (currentStatus === 'finished' || currentStatus === 'completed') {
            // Training completed while user was away
            setTuneId(storedTuneId);
            setStatus('completed');
            setProgress(100);
            localStorage.setItem('trainingStatus', 'completed');
            onTrainingComplete(storedTuneId);
            toast.success("🎉 Your AI model training completed while you were away!");
          } else if (currentStatus === 'training' || currentStatus === 'queued' || currentStatus === 'processing') {
            // Valid ongoing training
            console.log("Recovering valid training session:", storedTuneId);
            setTuneId(storedTuneId);
            setStatus('training');
            setIsTraining(true);
            setProgress(50); // Set a reasonable progress for ongoing training
            
            if (storedStartTime) {
              setStartTime(new Date(storedStartTime));
            }
            
            // Resume polling
            pollTrainingStatus(storedTuneId);
          } else if (currentStatus === 'failed' || currentStatus === 'error') {
            // Training failed
            setError("Training failed while you were away");
            setStatus('error');
            localStorage.setItem('trainingStatus', 'error');
          } else {
            // Unknown or invalid status, clear session
            console.log("Invalid tune status, clearing session");
            clearStoredSession();
          }
        } catch (error) {
          console.error("Error validating training session:", error);
          clearStoredSession();
        }
      } else if (storedStatus === 'completed') {
        // Completed session
        setTuneId(storedTuneId);
        setStatus('completed');
        setProgress(100);
      } else {
        // Invalid status, clear session
        console.log("Invalid stored status, clearing session");
        clearStoredSession();
      }
    };

    validateAndRecoverSession();
  }, []);

  // Helper function to clear stored session
  const clearStoredSession = () => {
    localStorage.removeItem('currentTuneId');
    localStorage.removeItem('trainingStatus');
    localStorage.removeItem('trainingStartTime');
    console.log("Cleared stale session data");
  };

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
    if (images.length === 0) {
      toast.error("No images provided for training");
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

      // Step 1: Create the tune first
      console.log("Creating tune...");
      const { data: tuneData, error: tuneError } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune'
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
      setStatus('uploading-images');
      setProgress(20);

      // Store tune ID for persistence
      localStorage.setItem('currentTuneId', createdTuneId);
      localStorage.setItem('trainingStatus', 'uploading-images');

      // Step 2: Upload images to the tune
      let uploadedCount = 0;
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        console.log(`Uploading image ${i+1}/${images.length}: ${file.name}`);
        
        try {
          // Convert file to base64
          const base64Data = await fileToBase64(file);
          
          // Upload to the tune with the created tuneId
          const { data: uploadData, error: uploadError } = await supabase.functions.invoke('astria', {
            body: {
              action: 'upload-images',
              image: base64Data,
              filename: file.name,
              contentType: file.type,
              tuneId: createdTuneId // Pass the tuneId explicitly
            }
          });
          
          if (uploadError) {
            console.error(`Upload error for image ${i+1}:`, uploadError);
            toast.error(`Error uploading image ${i+1}: ${uploadError.message}`);
            // Continue with other images instead of failing completely
          } else {
            uploadedCount++;
            console.log(`Successfully uploaded image ${i+1}`);
          }
        } catch (uploadError: any) {
          console.error(`Upload error for image ${i+1}:`, uploadError);
          toast.error(`Error uploading image ${i+1}: ${uploadError.message}`);
          // Continue with other images instead of failing completely
        }

        // Update progress
        const uploadProgress = 20 + ((i + 1) / images.length) * 30; // 20-50%
        setProgress(uploadProgress);
      }

      if (uploadedCount === 0) {
        throw new Error("Failed to upload any images");
      }

      console.log(`Successfully uploaded ${uploadedCount} out of ${images.length} images`);
      
      // Step 3: Start training by checking status (training starts automatically)
      setStatus('training');
      setProgress(50);
      localStorage.setItem('trainingStatus', 'training');

      // Show training started message
      toast.success(`Training started with ${uploadedCount} images. We'll email you when it's ready!`);

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
    clearStoredSession();
    
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
          disabled={isTraining || status === 'completed'}
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
          ) : (
            "Start AI Training (20-30 min)"
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
