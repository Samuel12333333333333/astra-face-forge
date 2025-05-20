
import React, { useState } from "react";
import Header from "@/components/Header";
import UploadSection from "@/components/UploadSection";
import StyleSelector from "@/components/StyleSelector";
import PreviewSection from "@/components/PreviewSection";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"upload" | "style" | "preview">("upload");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handlePhotoUploaded = (file: File) => {
    setUploadedImage(file);
  };

  const handleStyleSelected = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 md:py-12">
        {/* Hero section */}
        {currentStep === "upload" && (
          <div className="mb-12">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="mb-4 bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                Professional AI Headshots in Minutes
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transform your selfies into stunning professional portraits with our AI-powered headshot generator.
              </p>
            </div>
          </div>
        )}
        
        {currentStep === "upload" && (
          <UploadSection 
            onPhotoUploaded={handlePhotoUploaded}
            onContinue={() => setCurrentStep("style")}
          />
        )}
        
        {currentStep === "style" && (
          <StyleSelector 
            onStyleSelected={handleStyleSelected}
            onBack={() => setCurrentStep("upload")}
            onContinue={() => setCurrentStep("preview")}
          />
        )}
        
        {currentStep === "preview" && (
          <PreviewSection 
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            onBack={() => setCurrentStep("style")}
          />
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
