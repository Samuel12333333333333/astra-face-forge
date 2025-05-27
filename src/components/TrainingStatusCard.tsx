
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Sparkles, Mail } from "lucide-react";

interface TrainingStatusCardProps {
  status: 'idle' | 'creating-tune' | 'uploading-images' | 'training' | 'completed' | 'error';
  progress: number;
  error?: string | null;
  estimatedTimeRemaining?: number;
}

const TrainingStatusCard: React.FC<TrainingStatusCardProps> = ({
  status,
  progress,
  error,
  estimatedTimeRemaining
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'training':
        return <Sparkles className="h-8 w-8 text-brand-600 animate-pulse" />;
      default:
        return <Clock className="h-8 w-8 text-brand-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'creating-tune':
        return "Setting up your personalized AI model...";
      case 'uploading-images':
        return "Uploading your photos securely...";
      case 'training':
        return "Training your AI model for the best quality results";
      case 'completed':
        return "Your AI model is ready! You can now generate professional headshots.";
      case 'error':
        return "Something went wrong during training.";
      default:
        return "Ready to start training your personalized AI model.";
    }
  };

  const getDetailedInfo = () => {
    switch (status) {
      case 'training':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What's happening now?</h4>
              <p className="text-sm text-blue-700">
                Our AI is analyzing your photos and learning your unique features to create 
                the most accurate and professional headshots possible.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-900">Estimated Time</h4>
              </div>
              <p className="text-sm text-amber-700">
                {estimatedTimeRemaining ? 
                  `About ${Math.ceil(estimatedTimeRemaining / 60)} minutes remaining` :
                  "Usually takes 20-30 minutes for best quality"
                }
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">You can leave this page</h4>
              </div>
              <p className="text-sm text-green-700">
                We'll send you an email when your model is ready. Feel free to close 
                this tab and return later.
              </p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">🎉 Training Complete!</h4>
            <p className="text-sm text-green-700">
              Your personalized AI model is now ready to generate professional headshots. 
              Click "Continue" below to start creating your images.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            {getStatusIcon()}
            <div>
              <h3 className="text-xl font-medium mb-2">AI Model Training</h3>
              <p className="text-muted-foreground">{getStatusMessage()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {getDetailedInfo()}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingStatusCard;
