
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PreviewSectionProps {
  selectedStyle: string | null;
  tuneId: string | null;
  onBack: () => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ 
  selectedStyle,
  tuneId,
  onBack
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [effectiveTuneId, setEffectiveTuneId] = useState<string | null>(null);

  useEffect(() => {
    // First, try to use the tuneId from props
    let currentTuneId = tuneId;
    
    // If not available, try to get from localStorage
    if (!currentTuneId) {
      currentTuneId = localStorage.getItem('currentTuneId');
      console.log("Retrieved tuneId from localStorage:", currentTuneId);
    }
    
    if (currentTuneId) {
      setEffectiveTuneId(currentTuneId);
      generateHeadshots(currentTuneId);
    } else {
      console.error("No tuneId available for headshot generation");
      toast.error("No model ID available. Please create a model first.");
    }
  }, [tuneId]);

  const generateHeadshots = async (currentTuneId: string) => {
    if (!currentTuneId) {
      toast.error("No model ID available. Please try again.");
      return;
    }
    
    setIsGenerating(true);
    setSelectedImage(null);
    
    try {
      console.log("Starting headshot generation with tune ID:", currentTuneId);
      console.log("Selected style:", selectedStyle);
      
      // Set up the prompt based on selected style
      let prompt = "professional headshot";
      
      // Generate images using Supabase Function
      const { data, error } = await supabase.functions.invoke('astria/generate-headshots', {
        body: { 
          prompt, 
          numImages: 4, 
          styleType: selectedStyle || 'professional',
          tuneId: currentTuneId // Explicitly pass tuneId in the request
        }
      });
      
      if (error) {
        console.error("Generation error:", error);
        throw new Error(`Failed to generate headshots: ${error.message}`);
      }
      
      console.log("Generation response received");
      
      if (data && data.images && Array.isArray(data.images)) {
        const imageUrls = data.images.map((img: any) => img.url);
        setGeneratedImages(imageUrls);
        console.log("Generated image URLs:", imageUrls);
        
        if (imageUrls.length > 0) {
          toast.success(`Successfully generated ${imageUrls.length} headshots!`);
        } else {
          toast.warning("No images were generated. Try again with different settings.");
        }
      } else {
        console.error("Unexpected response format:", data);
        toast.error("Failed to generate headshots. Please try again.");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(`Error generating headshots: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    if (!selectedImage) return;
    
    try {
      // Fetch the image
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ai-headshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Your headshot has been downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleRegenerate = () => {
    if (effectiveTuneId) {
      generateHeadshots(effectiveTuneId);
    } else {
      toast.error("No model ID available. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Your Generated Headshots</h2>
        <p className="text-muted-foreground">
          {isGenerating 
            ? "We're creating your professional headshots..." 
            : "Select your favorite headshot to download"}
        </p>
      </div>
      
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse">Generating your headshots...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {generatedImages.length > 0 ? (
              generatedImages.map((image, index) => (
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
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p>No headshots generated yet. Click "Regenerate" to create some!</p>
              </div>
            )}
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

      {/* Debug info */}
      <div className="mt-8 p-4 border border-gray-200 rounded text-xs text-gray-500">
        <p>Debug Info:</p>
        <p>TuneId from props: {tuneId || 'Not provided'}</p>
        <p>TuneId from localStorage: {localStorage.getItem('currentTuneId') || 'Not available'}</p>
        <p>Effective TuneId: {effectiveTuneId || 'None'}</p>
        <p>Style: {selectedStyle || 'Not selected'}</p>
        <p>Generated Images: {generatedImages.length}</p>
      </div>
    </div>
  );
};

export default PreviewSection;
