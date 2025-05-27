import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import StyleSelector from "@/components/StyleSelector";
import PreviewSection from "@/components/PreviewSection";
import MultiUploadSection from "@/components/MultiUploadSection";
import TrainingSection from "@/components/TrainingSection";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, ArrowRight, Camera, Sparkles } from "lucide-react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"upload" | "training" | "style" | "preview">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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
          console.log("Auth state changed in Index:", _event, session?.user?.id);
          setIsAuthenticated(!!session);
          setIsLoading(false);
        });
        
        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session in Index:", session?.user?.id);
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
  }, [isAuthenticated]);

  const handleSignIn = async () => {
    try {
      // Clear any previous redirect URL hash that might be stuck
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      toast.info("Redirecting to Google for authentication...");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(`Authentication error: ${error.message}`);
    }
  };

  const handleImagesUploaded = (files: File[]) => {
    setUploadedFiles(files);
    console.log(`${files.length} files prepared for training`);
  };

  const handleTrainingComplete = (generatedTuneId: string) => {
    console.log("Training complete with tuneId:", generatedTuneId);
    setTuneId(generatedTuneId);
    // Store in localStorage for persistence
    localStorage.setItem('currentTuneId', generatedTuneId);
    toast.success("Training completed successfully!");
  };

  const handleStyleSelected = (styleId: string) => {
    console.log("Selected style:", styleId);
    setSelectedStyle(styleId);
    // Store in localStorage for persistence
    localStorage.setItem('selectedStyle', styleId);
    toast.success(`${styleId} style selected successfully!`);
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
        <p className="mt-4 text-muted-foreground">Loading your session...</p>
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
            <div className="mb-8 p-4 rounded-full bg-brand-100">
              <Camera className="h-12 w-12 text-brand-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              AI Headshot Generator
            </h1>
            <p className="mb-8 text-muted-foreground">
              Create professional headshots powered by AI. Sign in to get started.
            </p>
            <Button onClick={handleSignIn} size="lg" className="bg-brand-600 hover:bg-brand-700">
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
                images={uploadedFiles}
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

            {/* How It Works section */}
            {currentStep === "upload" && (
              <>
                <section id="how-it-works" className="py-16 border-t mt-16">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter mb-4">How It Works</h2>
                    <p className="text-muted-foreground">Our AI-powered platform transforms your photos into professional headshots in just a few simple steps.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <Camera className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Upload Photos</h3>
                      <p className="text-muted-foreground">Upload 10+ clear photos of yourself with varied expressions and angles.</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">AI Training</h3>
                      <p className="text-muted-foreground">Our AI learns your facial features to create accurate, high-quality representations.</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <ArrowRight className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Get Results</h3>
                      <p className="text-muted-foreground">Receive professional headshots in various styles ready for professional use.</p>
                    </div>
                  </div>
                </section>

                <section id="examples" className="py-16 border-t">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter mb-4">Example Results</h2>
                    <p className="text-muted-foreground">See the amazing transformations our AI creates for our users.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {["professional", "casual", "creative"].map((style) => (
                      <div key={style} className="overflow-hidden rounded-lg border shadow-sm">
                        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                          <div className="text-muted-foreground">Example {style} style</div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium capitalize">{style} Style</h4>
                          <p className="text-sm text-muted-foreground">Perfect for {style === 'professional' ? 'LinkedIn and resumes' : style === 'casual' ? 'social media profiles' : 'creative portfolios'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
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
