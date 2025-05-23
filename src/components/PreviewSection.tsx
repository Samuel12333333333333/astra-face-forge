
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Import smaller components
import SelectedHeadshotDisplay from "./headshots/SelectedHeadshotDisplay";
import HeadshotGallery from "./headshots/HeadshotGallery";
import HeadshotActionButtons from "./headshots/HeadshotActionButtons";
import EmptyHeadshotState from "./headshots/EmptyHeadshotState";
import StyleInfoCard from "./headshots/StyleInfoCard";

interface PreviewSectionProps {
  tuneId: string | null;
  selectedStyle: string | null;
  onBack: () => void;
}

// Define literal types for styles
type StyleType = 'professional' | 'casual' | 'creative';
const VALID_STYLES: StyleType[] = ['professional', 'casual', 'creative'];

// Define style prompts with string literal keys
const STYLE_PROMPTS: { [key in StyleType]: string } = {
  professional: "a professional headshot of sks person with studio lighting, neutral background, business attire",
  casual: "a casual portrait of sks person with natural lighting, relaxed expression, modern setting",
  creative: "an artistic portrait of sks person with dramatic lighting, creative composition, unique setting"
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
      console.error("Error fetching headshots:", error);
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
      
      // Simple style validation
      const styleToUse = VALID_STYLES.includes(selectedStyle as StyleType) 
        ? selectedStyle as StyleType 
        : 'professional';
      
      // Get the prompt for the validated style
      const prompt = STYLE_PROMPTS[styleToUse];
      
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'generate-headshots',
          tuneId: tuneId,
          prompt: prompt,
          styleType: styleToUse,
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
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(`Failed to generate headshots: ${error.message}`);
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
              <EmptyHeadshotState 
                onGenerate={generateHeadshots} 
                isGenerating={isGenerating} 
                hasTuneId={!!tuneId}
              />
            ) : (
              <>
                <SelectedHeadshotDisplay imageUrl={selectedHeadshot} />
                <HeadshotGallery 
                  headshots={headshots} 
                  selectedHeadshot={selectedHeadshot} 
                  onSelectHeadshot={setSelectedHeadshot} 
                />
                <HeadshotActionButtons 
                  onGenerate={generateHeadshots} 
                  onDownload={handleDownload} 
                  onShare={handleShare}
                  isGenerating={isGenerating}
                  isDownloading={isDownloading}
                  hasSelectedHeadshot={!!selectedHeadshot}
                />
              </>
            )}
          </CardContent>
        </Card>
        
        <div className="w-full md:w-1/3">
          <StyleInfoCard selectedStyle={selectedStyle} onBack={onBack} />
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;
