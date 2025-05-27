
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const startTraining = async () => {
    if (images.length === 0) {
      toast.error("No images provided for training");
      return;
    }

    setIsTraining(true);
    setProgress(0);
    setError(null);
    setStatus('creating-tune');

    try {
      // Step 1: Create the tune first
      console.log("Creating tune...");
      const { data: tuneData, error: tuneError } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune'
        }
      });

      if (tuneError) throw tuneError;
      if (!tuneData || !tuneData.id) {
        throw new Error("No tune ID received from creation");
      }

      const createdTuneId = tuneData.id;
      setTuneId(createdTuneId);
      setStatus('uploading-images');
      setProgress(20);

      console.log("Tune created successfully:", createdTuneId);

      // Step 2: Upload images to the tune
      let uploadedCount = 0;
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        console.log(`Uploading image ${i+1}/${images.length}: ${file.name}`);
        
        try {
          // Convert file to base64
          const base64Data = await fileToBase64(file);
          
          // Upload to the tune
          const { data: uploadData, error: uploadError } = await supabase.functions.invoke('astria', {
            body: {
              action: 'upload-images',
              image: base64Data,
              filename: file.name,
              contentType: file.type,
              tuneId: createdTuneId
            }
          });
          
          if (uploadError) {
            console.error(`Upload error for image ${i+1}:`, uploadError);
            toast.error(`Error uploading image ${i+1}`, { description: uploadError.message });
          } else {
            uploadedCount++;
            console.log(`Successfully uploaded image ${i+1}`);
          }
        } catch (uploadError: any) {
          console.error(`Upload error for image ${i+1}:`, uploadError);
          toast.error(`Error uploading image ${i+1}`, { description: uploadError.message });
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

      // Poll for training completion
      await pollTrainingStatus(createdTuneId);

    } catch (error: any) {
      console.error("Training error:", error);
      setError(error.message);
      setStatus('error');
      toast.error(`Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const pollTrainingStatus = async (tuneId: string) => {
    const maxAttempts = 60; // 10 minutes max
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.functions.invoke('astria', {
          body: {
            action: 'check-status',
            tuneId: tuneId
          }
        });

        if (error) throw error;

        const currentStatus = data?.status || 'unknown';
        console.log(`Training status: ${currentStatus}`);

        if (currentStatus === 'training') {
          const progressValue = 50 + (attempts / maxAttempts) * 40; // 50-90%
          setProgress(Math.min(progressValue, 90));
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 10000); // Check every 10 seconds
          } else {
            throw new Error("Training timeout - please try again");
          }
        } else if (currentStatus === 'finished' || currentStatus === 'completed') {
          setProgress(100);
          setStatus('completed');
          onTrainingComplete(tuneId);
          toast.success("Training completed successfully!");
        } else if (currentStatus === 'failed' || currentStatus === 'error') {
          throw new Error("Training failed on Astria's servers");
        } else {
          // Unknown status, continue polling
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 10000);
          } else {
            throw new Error("Training status unknown - please check manually");
          }
        }
      } catch (error: any) {
        console.error("Status check error:", error);
        setError(error.message);
        setStatus('error');
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

  const getStatusMessage = () => {
    switch (status) {
      case 'creating-tune':
        return "Creating your personalized AI model...";
      case 'uploading-images':
        return "Uploading your photos to the AI training system...";
      case 'training':
        return "Training your AI model (this may take 10-20 minutes)...";
      case 'completed':
        return "Training completed! Your AI model is ready.";
      case 'error':
        return "Training failed. Please try again.";
      default:
        return "Ready to start training your AI model.";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium text-center mb-6">AI Model Training</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Training Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-center mb-6">
            {status === 'error' ? (
              <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
            ) : status === 'completed' ? (
              <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
            ) : isTraining ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-600 mr-2" />
            ) : null}
            <p className="text-center text-muted-foreground">
              {getStatusMessage()}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={startTraining}
              disabled={isTraining || status === 'completed'}
              className="w-full bg-brand-600 hover:bg-brand-700"
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
                "Start AI Training"
              )}
            </Button>

            <Button
              onClick={onContinue}
              disabled={status !== 'completed'}
              variant={status === 'completed' ? "default" : "outline"}
              className="w-full"
            >
              Continue to Style Selection <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-4 text-center">
            <p>Training typically takes 10-20 minutes. You can safely leave this page during training.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSection;
