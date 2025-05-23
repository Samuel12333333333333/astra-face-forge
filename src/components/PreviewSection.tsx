import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PreviewSectionProps {
  tuneId: string | null;
  selectedStyle: string | null;
  onBack: () => void;
}

// Define a concrete type for style prompts to avoid excessive type instantiation
type StylePromptKey = 'professional' | 'casual' | 'creative';
type StylePromptMap = {
  [key in StylePromptKey]: string;
};

const PreviewSection: React.FC<PreviewSectionProps> = ({
  tuneId,
  selectedStyle,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [headshots, setHeadshots] = useState<string[]>([]);
  const [selectedHeadshot, setSelectedHeadshot] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Define style prompts with concrete type annotation
  const stylePrompts: StylePromptMap = {
    professional: "a professional headshot of sks person with studio lighting, neutral background, business attire",
    casual: "a casual portrait of sks person with natural lighting, relaxed expression, modern setting",
    creative: "an artistic portrait of sks person with dramatic lighting, creative composition, unique setting"
  };
  
  useEffect(() => {
    if (tuneId) {
      fetchExistingHeadshots();
    }
  }, [tuneId]);
  
  const fetchExistingHeadshots = async () => {
    try {
      setIsLoading(true);
      
      // First get the model ID from the tune ID
      const { data: models, error: modelError } = await supabase
        .from('models')
        .select('id')
        .eq('modelId', tuneId)
        .limit(1);
      
      if (modelError) throw modelError;
      
      if (!models || models.length === 0) {
        setIsLoading(false);
        return;
      }
      
      const modelId = models[0].id;
      
      // Now fetch images for this model
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('uri')
        .eq('modelId', modelId)
        .order('created_at', { ascending: false });
      
      if (imagesError) throw imagesError;
      
      if (images && images.length > 0) {
        const imageUrls = images.map(img => img.uri);
        setHeadshots(imageUrls);
        setSelectedHeadshot(imageUrls[0]); // Select the first image by default
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching headshots:", err);
      toast.error("Failed to load headshots");
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateHeadshots = async () => {
    if (!tuneId || !selectedStyle) {
      toast.error("Missing required information for generation");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Use type guards to safely determine the prompt style
      let promptStyle: StylePromptKey = 'professional'; // default
      
      if (selectedStyle === 'casual' || selectedStyle === 'creative') {
        promptStyle = selectedStyle;
      }
      
      // Safe access with properly typed key
      const prompt = stylePrompts[promptStyle];
      
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'generate-headshots',
          tuneId: tuneId,
          prompt: prompt,
          styleType: selectedStyle,
          numImages: 4
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (!data || !data.images || !Array.isArray(data.images)) {
        throw new Error("No images received from generation");
      }
      
      toast.success("Headshots generated successfully!");
      
      // Update the headshots list with new images
      setHeadshots(data.images);
      if (data.images.length > 0) {
        setSelectedHeadshot(data.images[0]);
      }
      
      // Reload from database to ensure we have the latest
      fetchExistingHeadshots();
    } catch (error) {
      const err = error as Error;
      console.error("Generation error:", err);
      toast.error(`Failed to generate headshots: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    if (!selectedHeadshot) return;
    
    try {
      setIsDownloading(true);
      
      const response = await fetch(selectedHeadshot);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `headshot-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Headshot downloaded successfully!");
    } catch (error) {
      const err = error as Error;
      console.error("Download error:", err);
      toast.error("Failed to download headshot");
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleShare = async () => {
    if (!selectedHeadshot) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Headshot',
          text: 'Check out my professional AI headshot!',
          url: selectedHeadshot
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(selectedHeadshot);
        toast.success("Image URL copied to clipboard!");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Share error:", err);
      toast.error("Failed to share headshot");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <h3 className="text-xl font-medium mb-6">Your AI Headshots</h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : headshots.length === 0 ? (
              <div className="h-64 w-full flex flex-col items-center justify-center text-center p-4 rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-4">No headshots have been generated yet.</p>
                <Button 
                  onClick={generateHeadshots} 
                  disabled={isGenerating || !tuneId}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Headshots
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                <div className="aspect-square w-full max-w-md mb-4 rounded-lg overflow-hidden border">
                  {selectedHeadshot && (
                    <img 
                      src={selectedHeadshot} 
                      alt="Selected AI Headshot" 
                      className="object-cover w-full h-full" 
                      onError={(e) => {
                        console.error("Image load error");
                        e.currentTarget.src = "https://via.placeholder.com/400?text=Image+Load+Error";
                      }}
                    />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {headshots.slice(0, 8).map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedHeadshot(url)}
                      className={`aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        url === selectedHeadshot ? 'border-brand-600' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Headshot ${index + 1}`} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error("Thumbnail load error");
                          e.currentTarget.src = "https://via.placeholder.com/100?text=Error";
                        }} 
                      />
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button 
                    onClick={generateHeadshots} 
                    disabled={isGenerating}
                    className="bg-brand-600 hover:bg-brand-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate More
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleDownload} 
                    disabled={!selectedHeadshot || isDownloading}
                    variant="outline"
                  >
                    {isDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download
                  </Button>
                  
                  <Button 
                    onClick={handleShare} 
                    disabled={!selectedHeadshot}
                    variant="outline"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Selected Style</h3>
              
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <p className="font-medium capitalize">
                  {selectedStyle || "Default"} Style
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedStyle === 'professional' ? 
                    'Professional lighting with neutral background' : 
                    selectedStyle === 'casual' ? 
                    'Natural lighting with casual setting' : 
                    selectedStyle === 'creative' ? 
                    'Artistic lighting with creative composition' : 
                    'Standard headshot with good lighting'
                  }
                </p>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  onClick={onBack} 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Style
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;
