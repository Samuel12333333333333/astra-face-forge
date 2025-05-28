import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Share2, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PreviewSectionProps {
  selectedStyle: string;
  tuneId: string | null;
  onImagesGenerated: (images: string[]) => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  selectedStyle,
  tuneId,
  onImagesGenerated
}) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStyle && tuneId) {
      generateInitialImages();
    }
  }, [selectedStyle, tuneId]);

  const generateInitialImages = async () => {
    if (!tuneId || !selectedStyle) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'generate-headshots',
          tuneId: tuneId,
          prompt: `${selectedStyle} headshot, professional quality`,
          numImages: 4
        }
      });

      if (error) throw error;

      if (data?.images) {
        setGeneratedImages(data.images);
        setSelectedImage(data.images[0]);
        onImagesGenerated(data.images);
        toast.success('Generated preview images!');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error('Failed to generate preview images');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `headshot-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleShare = async () => {
    if (!selectedImage) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Headshot',
          text: 'Check out my professional AI headshot!',
          url: selectedImage
        });
      } else {
        await navigator.clipboard.writeText(selectedImage);
        toast.success("Image URL copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to share image");
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Preview Your Headshots</h1>
        <p className="text-gray-600">
          Style: <Badge variant="outline" className="ml-1">{selectedStyle}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selected Image</CardTitle>
            <CardDescription>
              Click on thumbnails below to change selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedImage ? (
              <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                <img 
                  src={selectedImage} 
                  alt="Selected headshot"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-2" />
                    <p className="text-gray-500">Generating your headshots...</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No image selected</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Variants</CardTitle>
            <CardDescription>
              Choose your favorite from the generated options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image 
                        ? 'border-brand-600 ring-2 ring-brand-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Variant ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {isGenerating ? 'Generating images...' : 'No images generated yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={generateInitialImages}
          disabled={isGenerating || !tuneId}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate More
        </Button>
        
        <Button
          onClick={handleDownload}
          disabled={!selectedImage}
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        
        <Button
          onClick={handleShare}
          disabled={!selectedImage}
          variant="outline"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        
        <Button
          onClick={goToDashboard}
          className="bg-brand-600 hover:bg-brand-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PreviewSection;
