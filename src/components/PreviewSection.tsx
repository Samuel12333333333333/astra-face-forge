
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  // Generate headshots on component mount
  useEffect(() => {
    if (tuneId) {
      generateHeadshots();
    }
  }, [tuneId]);

  const generateHeadshots = async () => {
    setIsGenerating(true);
    setSelectedImage(null);
    
    try {
      // Set up the prompt based on selected style
      let prompt = "professional headshot";
      
      // Generate images using the API
      const response = await fetch('/api/astria/generate-headshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          prompt: prompt,
          numImages: 4,
          styleType: selectedStyle
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate headshots");
      }
      
      const result = await response.json();
      
      if (result.images && Array.isArray(result.images)) {
        const imageUrls = result.images.map((img: any) => img.url);
        setGeneratedImages(imageUrls);
      } else {
        toast.error("No images were generated");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Error generating headshots. Please try again.");
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
              <Button variant="outline" onClick={generateHeadshots}>
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
