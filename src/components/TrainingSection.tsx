
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'uploading' | 'training' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const startTraining = async () => {
    try {
      setIsTraining(true);
      setTrainingStatus('uploading');
      setStatusMessage('Uploading images...');
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert images to base64
      const imageData = await Promise.all(
        images.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            data: base64
          };
        })
      );

      setProgress(30);
      setStatusMessage('Starting AI training...');

      // Call the Astria edge function to start training
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune',
          images: imageData,
          name: `Model ${Date.now()}`
        }
      });

      if (error) throw error;

      if (data.tuneId) {
        setTuneId(data.tuneId);
        setTrainingStatus('training');
        setStatusMessage('Training your AI model...');
        setProgress(50);
        
        // Start polling for status
        pollTrainingStatus(data.tuneId);
      }
    } catch (error: any) {
      console.error('Training error:', error);
      setTrainingStatus('failed');
      setStatusMessage('Training failed');
      toast.error(`Training failed: ${error.message}`);
      setIsTraining(false);
    }
  };

  const pollTrainingStatus = async (tuneId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('astria', {
          body: {
            action: 'get-tune-status',
            tuneId: tuneId
          }
        });

        if (error) throw error;

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setTrainingStatus('completed');
          setProgress(100);
          setStatusMessage('Training completed successfully!');
          setIsTraining(false);
          onTrainingComplete(tuneId);
          toast.success('🎉 Your AI model is ready!');
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setTrainingStatus('failed');
          setStatusMessage('Training failed');
          setIsTraining(false);
          toast.error('Training failed. Please try again.');
        } else {
          // Still training
          setProgress(Math.min(90, progress + 5));
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 10000); // Check every 10 seconds

    // Cleanup after 30 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 30 * 60 * 1000);
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
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Training</CardTitle>
          <CardDescription>
            We'll train a personalized AI model using your uploaded images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h3 className="text-lg font-medium mb-2">
              {trainingStatus === 'idle' && 'Ready to Start Training'}
              {trainingStatus === 'uploading' && 'Uploading Images'}
              {trainingStatus === 'training' && 'Training AI Model'}
              {trainingStatus === 'completed' && 'Training Complete!'}
              {trainingStatus === 'failed' && 'Training Failed'}
            </h3>
            <p className="text-gray-600 mb-4">{statusMessage}</p>
            
            {(trainingStatus === 'uploading' || trainingStatus === 'training') && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500">{progress}% complete</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Training Details:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Images to process: {images.length}</li>
              <li>• Estimated time: 20-30 minutes</li>
              <li>• You'll receive an email notification when ready</li>
              <li>• You can safely leave this page during training</li>
            </ul>
          </div>

          <div className="flex justify-between">
            {trainingStatus === 'idle' && (
              <Button 
                onClick={startTraining}
                disabled={images.length < 5}
                className="w-full bg-brand-600 hover:bg-brand-700"
              >
                Start AI Training
              </Button>
            )}
            
            {trainingStatus === 'completed' && (
              <Button 
                onClick={onContinue}
                className="w-full bg-brand-600 hover:bg-brand-700"
              >
                Continue to Style Selection
              </Button>
            )}
            
            {trainingStatus === 'failed' && (
              <Button 
                onClick={startTraining}
                variant="outline"
                className="w-full"
              >
                Retry Training
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSection;
