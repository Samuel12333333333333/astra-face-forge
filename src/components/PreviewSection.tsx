
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample placeholder images for demonstration
const placeholderImages = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

interface PreviewSectionProps {
  uploadedImage: File | null;
  selectedStyle: string | null;
  onBack: () => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ 
  uploadedImage, 
  selectedStyle,
  onBack
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Simulate generation process - in a real app, this would be an API call
  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImages(placeholderImages);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDownload = () => {
    // In a real app, this would download the selected image
    alert("In a real implementation, this would download your selected headshot.");
  };
  
  const handleRegenerate = () => {
    setIsGenerating(true);
    setSelectedImage(null);
    
    // Simulate regeneration
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImages(placeholderImages);
    }, 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="mb-2">Your Generated Headshots</h2>
        <p className="text-muted-foreground">
          {isGenerating 
            ? "We're creating your professional headshots..." 
            : "Select your favorite headshot to download"}
        </p>
      </div>
      
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse-slow">Generating your headshots...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {generatedImages.map((image, index) => (
              <Card 
                key={index}
                className={cn(
                  "overflow-hidden border-2 cursor-pointer transition-all hover:shadow-md",
                  selectedImage === image ? "border-brand-500 ring-2 ring-brand-500/20" : "border-border"
                )}
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0">
                  <div className="aspect-[3/4] relative">
                    <img 
                      src={image} 
                      alt={`Generated headshot ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button variant="outline" onClick={handleRegenerate}>
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </div>
            <Button disabled={!selectedImage} onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PreviewSection;
