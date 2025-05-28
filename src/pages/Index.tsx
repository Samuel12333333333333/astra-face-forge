
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import ThemeSelector from "@/components/styles/ThemeSelector";
import PreviewSection from "@/components/PreviewSection";
import MultiUploadSection from "@/components/MultiUploadSection";
import TrainingSection from "@/components/TrainingSection";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, ArrowRight, Camera, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"onboarding" | "upload" | "training" | "style" | "preview">("onboarding");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [tuneId, setTuneId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log("Auth state changed in Index:", _event, session?.user?.id);
          setIsAuthenticated(!!session);
          setIsLoading(false);
          
          if (session && currentStep === "onboarding") {
            // Check if user has completed onboarding before
            const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
            if (hasCompletedOnboarding) {
              navigate('/dashboard');
            }
          }
        });
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session in Index:", session?.user?.id);
        setIsAuthenticated(!!session);
        setIsLoading(false);
        
        if (session && currentStep === "onboarding") {
          const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
          if (hasCompletedOnboarding) {
            navigate('/dashboard');
          }
        }
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Authentication check error:", error);
        toast.error("Error checking authentication status");
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, currentStep]);

  const handleSignIn = async () => {
    try {
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

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    setUserProfile(data);
    localStorage.setItem('userProfile', JSON.stringify(data));
    localStorage.setItem('onboardingCompleted', 'true');
    setCurrentStep("upload");
    toast.success("Welcome! Let's create your first AI headshot.");
  };

  const handleImagesUploaded = (files: File[]) => {
    console.log(`Received ${files.length} files for training:`, files.map(f => f.name));
    setUploadedFiles(files);
  };

  const handleTrainingComplete = (generatedTuneId: string) => {
    console.log("Training complete with tuneId:", generatedTuneId);
    setTuneId(generatedTuneId);
    localStorage.setItem('currentTuneId', generatedTuneId);
    localStorage.setItem('trainingStatus', 'completed');
    toast.success("🎉 Training completed! Your AI model is ready for theme selection.");
  };

  const handleThemeSelected = (themeId: string) => {
    console.log("Selected theme:", themeId);
    setSelectedTheme(themeId);
    localStorage.setItem('selectedTheme', themeId);
    toast.success(`${themeId} theme selected successfully!`);
  };
  
  const handleStepChange = (step: "onboarding" | "upload" | "training" | "style" | "preview") => {
    console.log("Changing step to:", step);
    setCurrentStep(step);
    localStorage.setItem('currentStep', step);
  };

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
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-16">
            <div className="mb-8 p-4 rounded-full bg-brand-100">
              <Camera className="h-12 w-12 text-brand-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              AI Personal Branding Platform
            </h1>
            <p className="mb-8 text-muted-foreground">
              Transform your selfies into stunning, professional portraits that tell your unique story. Sign in to begin your brand journey.
            </p>
            <Button onClick={handleSignIn} size="lg" className="bg-brand-600 hover:bg-brand-700">
              <User className="mr-2 h-4 w-4" /> Sign in with Google
            </Button>
          </div>
        ) : (
          <>
            {currentStep === "onboarding" && (
              <div className="mb-12">
                <div className="text-center max-w-4xl mx-auto mb-8">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                    Build Your Personal Brand
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">
                    Let's understand your goals and create the perfect AI headshots for your personal brand story.
                  </p>
                </div>
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </div>
            )}

            {currentStep === "upload" && (
              <div className="mb-12">
                <div className="text-center max-w-3xl mx-auto">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                    Upload Your Training Photos
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">
                    Upload 5+ high-quality selfies so our AI can learn your unique features.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                    <p className="text-blue-900 font-medium mb-2">⏱️ Your personalized journey:</p>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>1. Upload photos (2 minutes)</p>
                      <p>2. AI trains your model (20-30 minutes)</p>
                      <p>3. Choose your brand theme (1 minute)</p>
                      <p>4. Generate unlimited headshots (instant)</p>
                    </div>
                  </div>
                </div>
                <MultiUploadSection 
                  onImagesUploaded={handleImagesUploaded}
                  onContinue={() => {
                    if (uploadedFiles.length === 0) {
                      toast.error("Please upload images first");
                      return;
                    }
                    handleStepChange("training");
                  }}
                />
              </div>
            )}
            
            {currentStep === "training" && (
              <div className="mb-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h1 className="text-3xl font-bold mb-4">Training Your Personal AI Model</h1>
                  <p className="text-muted-foreground">
                    We're creating a personalized AI model that captures your unique features and essence.
                  </p>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      📁 Training with {uploadedFiles.length} photos for optimal results
                    </p>
                  </div>
                </div>
                <TrainingSection 
                  images={uploadedFiles}
                  onTrainingComplete={handleTrainingComplete}
                  onContinue={() => handleStepChange("style")}
                />
              </div>
            )}
            
            {currentStep === "style" && (
              <ThemeSelector 
                onThemeSelected={handleThemeSelected}
                onBack={() => handleStepChange("training")}
                onContinue={() => handleStepChange("preview")}
                userProfile={userProfile}
              />
            )}
            
            {currentStep === "preview" && (
              <PreviewSection 
                selectedStyle={selectedTheme}
                tuneId={tuneId}
                onBack={() => handleStepChange("style")}
              />
            )}

            {currentStep === "upload" && (
              <>
                <section id="how-it-works" className="py-16 border-t mt-16">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter mb-4">How Your Brand Journey Works</h2>
                    <p className="text-muted-foreground">Our AI-powered platform creates personalized brand assets in four simple steps.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <span className="text-brand-600 font-bold">1</span>
                      </div>
                      <h3 className="text-xl font-medium mb-2">Define Your Brand</h3>
                      <p className="text-muted-foreground mb-2">Tell us your goals, industry, and personality.</p>
                      <p className="text-sm text-brand-600 font-medium">~3 minutes</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <Camera className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Upload Photos</h3>
                      <p className="text-muted-foreground mb-2">Upload 5+ photos with varied expressions.</p>
                      <p className="text-sm text-blue-600 font-medium">~2 minutes</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">AI Training</h3>
                      <p className="text-muted-foreground mb-2">AI learns your features and brand style.</p>
                      <p className="text-sm text-amber-600 font-medium">~25 minutes</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <ArrowRight className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Brand Assets</h3>
                      <p className="text-muted-foreground mb-2">Get headshots, covers, and brand kit.</p>
                      <p className="text-sm text-green-600 font-medium">Instant</p>
                    </div>
                  </div>
                </section>

                <section id="themes" className="py-16 border-t">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter mb-4">Brand Themes</h2>
                    <p className="text-muted-foreground">Choose from our curated collection of professional brand themes.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {["Boardroom Bold", "Creative Edge", "Startup Visionary"].map((theme) => (
                      <div key={theme} className="overflow-hidden rounded-lg border shadow-sm">
                        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                          <div className="text-muted-foreground">{theme} Preview</div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium">{theme}</h4>
                          <p className="text-sm text-muted-foreground">
                            {theme === 'Boardroom Bold' ? 'Executive leadership presence' : 
                             theme === 'Creative Edge' ? 'Artistic innovation vibes' : 
                             'Entrepreneurial vision'}
                          </p>
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
            AI Personal Branding Platform © {new Date().getFullYear()}
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
