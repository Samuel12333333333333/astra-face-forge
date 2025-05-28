
import React, { useState } from "react";
import Header from "@/components/Header";
import MultiUploadSection from "@/components/MultiUploadSection";
import TrainingSection from "@/components/TrainingSection";
import StyleSelector from "@/components/StyleSelector";
import PreviewSection from "@/components/PreviewSection";
import { StepNavigation } from "@/components/StepNavigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [modelName, setModelName] = useState("");
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isStepLoading, setIsStepLoading] = useState(false);

  // Redirect to dashboard if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePhotosUploaded = (files: File[], name: string) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.error('Invalid files provided:', files);
      return;
    }
    
    console.log('Photos uploaded:', files.length, 'files, model name:', name);
    setUploadedFiles([...files]); // Create a new array to ensure state update
    setModelName(name || '');
  };

  const handleTrainingComplete = (completedTuneId: string) => {
    if (!completedTuneId) {
      console.error('Invalid tune ID provided:', completedTuneId);
      return;
    }
    
    console.log('Training completed with tune ID:', completedTuneId);
    setTuneId(completedTuneId);
  };

  const handleStyleSelected = (style: string) => {
    if (!style) {
      console.error('Invalid style provided:', style);
      return;
    }
    
    console.log('Style selected:', style);
    setSelectedStyle(style);
    setCurrentStep(4);
  };

  const handleImagesGenerated = (images: string[]) => {
    if (!images || !Array.isArray(images)) {
      console.error('Invalid images provided:', images);
      return;
    }
    
    console.log('Images generated:', images.length);
    setGeneratedImages([...images]);
  };

  const canGoBack = () => {
    if (currentStep === 1) return false;
    if (currentStep === 2 && isStepLoading) return false;
    return true;
  };

  const canGoForward = () => {
    switch (currentStep) {
      case 1:
        return uploadedFiles.length >= 5 && modelName.trim().length > 0;
      case 2:
        return tuneId !== null && tuneId.length > 0;
      case 3:
        return selectedStyle.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleBack = () => {
    if (canGoBack()) {
      const newStep = Math.max(1, currentStep - 1);
      console.log('Going back to step:', newStep);
      setCurrentStep(newStep);
    }
  };

  const handleForward = () => {
    if (canGoForward()) {
      const newStep = Math.min(4, currentStep + 1);
      console.log('Going forward to step:', newStep);
      setCurrentStep(newStep);
    }
  };

  const renderCurrentStep = () => {
    try {
      switch (currentStep) {
        case 1:
          return (
            <MultiUploadSection
              onPhotosUploaded={handlePhotosUploaded}
              onContinue={() => setCurrentStep(2)}
            />
          );
        case 2:
          return (
            <TrainingSection
              images={uploadedFiles}
              modelName={modelName}
              onTrainingComplete={handleTrainingComplete}
              onContinue={() => setCurrentStep(3)}
            />
          );
        case 3:
          return (
            <StyleSelector
              onStyleSelected={handleStyleSelected}
              tuneId={tuneId}
            />
          );
        case 4:
          return (
            <PreviewSection
              selectedStyle={selectedStyle}
              tuneId={tuneId}
              onImagesGenerated={handleImagesGenerated}
            />
          );
        default:
          console.error('Invalid step:', currentStep);
          return (
            <MultiUploadSection
              onPhotosUploaded={handlePhotosUploaded}
              onContinue={() => setCurrentStep(2)}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering step:', currentStep, error);
      return (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading step. Please refresh the page.</p>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Professional AI Headshots
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your photos, train a personalized AI model, and generate stunning professional headshots in minutes.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${currentStep >= step 
                      ? 'bg-brand-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`
                      w-16 h-1 transition-colors
                      ${currentStep > step ? 'bg-brand-600' : 'bg-gray-200'}
                    `} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-center items-center space-x-16 mt-2">
              <span className="text-xs text-gray-500">Upload</span>
              <span className="text-xs text-gray-500">Train</span>
              <span className="text-xs text-gray-500">Style</span>
              <span className="text-xs text-gray-500">Generate</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 lg:p-8">
            {renderCurrentStep()}
            
            {currentStep > 1 && (
              <StepNavigation
                currentStep={currentStep}
                totalSteps={4}
                canGoBack={canGoBack()}
                canGoForward={canGoForward()}
                onBack={handleBack}
                onForward={handleForward}
                isLoading={isStepLoading}
              />
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
