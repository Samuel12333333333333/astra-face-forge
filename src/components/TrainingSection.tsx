
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, Clock, AlertCircle, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrainingSectionProps {
  images: File[];
  modelName: string;
  onTrainingComplete: (tuneId: string) => void;
  onContinue: () => void;
}

const TrainingSection: React.FC<TrainingSectionProps> = ({
  images,
  modelName,
  onTrainingComplete,
  onContinue
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'uploading' | 'training' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  const startTraining = async () => {
    try {
      setIsTraining(true);
      setTrainingStatus('uploading');
      setStatusMessage('Preparing images for training...');
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log(`Starting training with ${images.length} images for model: ${modelName}`);

      // Convert images to base64
      setStatusMessage('Processing images...');
      const imageData = await Promise.all(
        images.map(async (file) => {
          const base64 = await fileToBase64(file);
          return base64; // Just return the base64 string
        })
      );

      setProgress(30);
      setStatusMessage('Uploading to AI training service...');

      // Call the Astria edge function to start training
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune-with-images',
          images: imageData,
          name: modelName
        }
      });

      if (error) {
        console.error('Astria function error:', error);
        throw error;
      }

      console.log('Astria response:', data);

      if (data.id) {
        setTuneId(data.id);
        setTrainingStatus('training');
        setStatusMessage('AI model training in progress...');
        setProgress(50);
        setEstimatedTime(20 * 60 * 1000); // 20 minutes in milliseconds
        
        // Start polling for status
        pollTrainingStatus(data.id);
        
        toast.success('Training started! We\'ll notify you when it\'s ready.');
      } else {
        throw new Error('No tune ID returned from training service');
      }
    } catch (error: any) {
      console.error('Training error:', error);
      setTrainingStatus('failed');
      setStatusMessage(`Training failed: ${error.message}`);
      toast.error(`Training failed: ${error.message}`);
      setIsTraining(false);
    }
  };

  const pollTrainingStatus = async (tuneId: string) => {
    console.log('Starting status polling for tune:', tuneId);
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('Checking training status for tune:', tuneId);
        
        const { data, error } = await supabase.functions.invoke('astria', {
          body: {
            action: 'check-status',
            tuneId: tuneId
          }
        });

        if (error) {
          console.error('Status check error:', error);
          return;
        }

        console.log('Status check response:', data);

        if (data.status === 'completed' || data.trained_at) {
          clearInterval(pollInterval);
          setTrainingStatus('completed');
          setProgress(100);
          setStatusMessage('Training completed successfully!');
          setIsTraining(false);
          onTrainingComplete(tuneId);
          toast.success('🎉 Your AI model is ready! You can now generate headshots.');
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setTrainingStatus('failed');
          setStatusMessage('Training failed');
          setIsTraining(false);
          toast.error('Training failed. Please try again with different photos.');
        } else if (data.status === 'training' || data.status === 'processing') {
          // Still training - update progress
          const newProgress = Math.min(90, progress + 2);
          setProgress(newProgress);
          setStatusMessage('Training in progress... This may take 15-25 minutes.');
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 30000); // Check every 30 seconds

    // Cleanup after 45 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (trainingStatus === 'training') {
        console.log('Training timeout reached');
        setStatusMessage('Training is taking longer than expected. Please check back later.');
      }
    }, 45 * 60 * 1000);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
    });
  };

  const getStatusIcon = () => {
    switch (trainingStatus) {
      case 'uploading':
      case 'training':
        return <Loader2 className="h-8 w-8 animate-spin text-brand-600" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-gray-400" />;
    }
  };

  const getDetailedInfo = () => {
    switch (trainingStatus) {
      case 'training':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What's happening now?</h4>
              <p className="text-sm text-blue-700">
                Our AI is analyzing your {images.length} photos and learning your unique features to create 
                the most accurate and professional headshots possible.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-900">Estimated Time</h4>
              </div>
              <p className="text-sm text-amber-700">
                Usually takes 15-25 minutes for best quality results
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">Stay Updated</h4>
              </div>
              <p className="text-sm text-green-700">
                You can safely leave this page. We'll show the status on your dashboard when ready!
              </p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">🎉 Training Complete!</h4>
            <p className="text-sm text-green-700">
              Your AI model "{modelName}" is now ready to generate professional headshots. 
              Click "Continue" below to start creating your images.
            </p>
          </div>
        );
      case 'failed':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Training Failed</h4>
            <p className="text-sm text-red-700">
              Please try again with different photos. Make sure they are clear, well-lit, and show your face clearly.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Ready to Train</h4>
            <p className="text-sm text-blue-700">
              We'll use your {images.length} photos to train a personalized AI model named "{modelName}".
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Training</CardTitle>
          <CardDescription>
            Training your personalized AI model with {images.length} photos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">
                {trainingStatus === 'idle' && 'Ready to Start Training'}
                {trainingStatus === 'uploading' && 'Preparing Images'}
                {trainingStatus === 'training' && 'Training AI Model'}
                {trainingStatus === 'completed' && 'Training Complete!'}
                {trainingStatus === 'failed' && 'Training Failed'}
              </h3>
              <p className="text-muted-foreground">{statusMessage}</p>
            </div>
          </div>

          {(trainingStatus === 'uploading' || trainingStatus === 'training') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {getDetailedInfo()}

          <div className="flex justify-center">
            {trainingStatus === 'idle' && (
              <Button 
                onClick={startTraining}
                disabled={images.length < 5}
                className="w-full bg-brand-600 hover:bg-brand-700"
                size="lg"
              >
                Start AI Training
              </Button>
            )}
            
            {trainingStatus === 'completed' && (
              <Button 
                onClick={onContinue}
                className="w-full bg-brand-600 hover:bg-brand-700"
                size="lg"
              >
                Continue to Generate Headshots
              </Button>
            )}
            
            {trainingStatus === 'failed' && (
              <Button 
                onClick={startTraining}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Retry Training
              </Button>
            )}

            {trainingStatus === 'training' && (
              <Button 
                variant="outline"
                className="w-full"
                disabled
                size="lg"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training in Progress...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSection;
