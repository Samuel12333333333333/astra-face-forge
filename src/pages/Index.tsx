
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import StyleSelector from "@/components/StyleSelector";
import PreviewSection from "@/components/PreviewSection";
import MultiUploadSection from "@/components/MultiUploadSection";
import TrainingSection from "@/components/TrainingSection";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "lucide-react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"upload" | "training" | "style" | "preview">("upload");
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state change listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setIsAuthenticated(!!session);
          setIsLoading(false);
        });
        
        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setIsLoading(false);
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Authentication check error:", error);
        toast.error("Error checking authentication status");
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Try to recover from localStorage if coming back to the app
  useEffect(() => {
    const storedTuneId = localStorage.getItem('currentTuneId');
    const storedStyle = localStorage.getItem('selectedStyle');
    const storedStep = localStorage.getItem('currentStep') as "upload" | "training" | "style" | "preview" | null;
    
    if (storedTuneId) {
      console.log("Recovered tuneId from localStorage:", storedTuneId);
      setTuneId(storedTuneId);
    }
    
    if (storedStyle) {
      console.log("Recovered style from localStorage:", storedStyle);
      setSelectedStyle(storedStyle);
    }
    
    if (storedStep && storedStep !== "upload") {
      console.log("Recovered step from localStorage:", storedStep);
      setCurrentStep(storedStep);
    }
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(`Authentication error: ${error.message}`);
    }
  };

  const handleImagesUploaded = (imageIds: string[]) => {
    setUploadedImageIds(imageIds);
  };

  const handleTrainingComplete = (generatedTuneId: string) => {
    console.log("Training complete with tuneId:", generatedTuneId);
    setTuneId(generatedTuneId);
    // Store in localStorage for persistence
    localStorage.setItem('currentTuneId', generatedTuneId);
  };

  const handleStyleSelected = (styleId: string) => {
    console.log("Selected style:", styleId);
    setSelectedStyle(styleId);
    // Store in localStorage for persistence
    localStorage.setItem('selectedStyle', styleId);
  };
  
  const handleStepChange = (step: "upload" | "training" | "style" | "preview") => {
    setCurrentStep(step);
    // Store current step in localStorage
    localStorage.setItem('currentStep', step);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-brand-600 rounded-full"></div>
          <div className="h-3 w-3 bg-brand-600 rounded-full"></div>
          <div className="h-3 w-3 bg-brand-600 rounded-full"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 md:py-12">
        {/* Auth gate */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-16">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              AI Headshot Generator
            </h1>
            <p className="mb-8 text-muted-foreground">
              Please sign in to create your professional AI headshots
            </p>
            <Button onClick={handleSignIn} size="lg">
              <User className="mr-2 h-4 w-4" /> Sign in with Google
            </Button>
          </div>
        ) : (
          <>
            {/* Hero section */}
            {currentStep === "upload" && (
              <div className="mb-12">
                <div className="text-center max-w-3xl mx-auto">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                    Professional AI Headshots in Minutes
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Transform your selfies into stunning professional portraits with our AI-powered headshot generator.
                  </p>
                </div>
              </div>
            )}
            
            {currentStep === "upload" && (
              <MultiUploadSection 
                onImagesUploaded={handleImagesUploaded}
                onContinue={() => handleStepChange("training")}
              />
            )}
            
            {currentStep === "training" && (
              <TrainingSection 
                imageIds={uploadedImageIds}
                onTrainingComplete={handleTrainingComplete}
                onContinue={() => handleStepChange("style")}
              />
            )}
            
            {currentStep === "style" && (
              <StyleSelector 
                onStyleSelected={handleStyleSelected}
                onBack={() => handleStepChange("training")}
                onContinue={() => handleStepChange("preview")}
              />
            )}
            
            {currentStep === "preview" && (
              <PreviewSection 
                selectedStyle={selectedStyle}
                tuneId={tuneId}
                onBack={() => handleStepChange("style")}
              />
            )}
          </>
        )}
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            AI Headshots Generator © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
