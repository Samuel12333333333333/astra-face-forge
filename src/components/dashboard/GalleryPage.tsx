
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Model {
  id: number;
  name: string | null;
  modelid: string | null;
  status: string;
}

interface GeneratedImage {
  id: number;
  uri: string;
  created_at: string;
  modelid: number;
}

const GalleryPage = () => {
  const { tuneId } = useParams();
  const [model, setModel] = useState<Model | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGalleryData();
  }, [tuneId]);

  const loadGalleryData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the model details
      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .select('*')
        .eq('modelid', tuneId)
        .eq('user_id', user.id)
        .single();

      if (modelError) throw modelError;
      setModel(modelData);

      // Then get all generated images for this model
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .eq('modelid', modelData.id)
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);
    } catch (error: any) {
      console.error('Error loading gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `headshot-${index + 1}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Headshot',
          text: 'Check out my professional AI headshot!',
          url: imageUrl
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success("Image URL copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share image");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Model Not Found</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">The requested model could not be found.</p>
            <Link to="/dashboard/tunes">
              <Button className="mt-4">Back to My Models</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/tunes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Models
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
          <Badge className="bg-blue-100 text-blue-800">
            {images.length} {images.length === 1 ? 'Image' : 'Images'}
          </Badge>
        </div>
        {model.status === 'completed' && (
          <Link to={`/dashboard/tunes/${model.modelid}/generate`}>
            <Button className="bg-brand-600 hover:bg-brand-700">
              Generate More Images
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model: {model.name || `Model ${model.id.toString().slice(-8)}`}</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images generated yet</h3>
              <p className="text-gray-500 mb-6">Start generating professional headshots with this model</p>
              {model.status === 'completed' && (
                <Link to={`/dashboard/tunes/${model.modelid}/generate`}>
                  <Button className="bg-brand-600 hover:bg-brand-700">
                    Generate Your First Images
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                    <img 
                      src={image.uri} 
                      alt={`Generated headshot ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                      }}
                    />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(image.uri, index)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleShare(image.uri)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image info */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryPage;
