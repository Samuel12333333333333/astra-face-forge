
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Model {
  id: number;
  name: string | null;
  modelid: string | null;
  status: string;
  created_at: string;
}

const GeneratePage = () => {
  const { tuneId } = useParams();
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(4);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  useEffect(() => {
    loadModelDetails();
  }, [tuneId]);

  const loadModelDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('modelid', tuneId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setModel(data);
    } catch (error: any) {
      console.error('Error loading model:', error);
      toast.error('Failed to load model details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!model || !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'generate-headshots',
          tuneId: model.modelid,
          prompt: prompt,
          numImages: numImages
        }
      });

      if (error) throw error;

      if (data?.images) {
        setGeneratedImages(data.images);
        toast.success(`Generated ${data.images.length} images successfully!`);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(`Failed to generate images: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  if (model.status !== 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/tunes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Models
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Generate Headshots</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Model is not ready for generation</p>
              <Badge variant="secondary">{model.status}</Badge>
              <p className="text-sm text-gray-500 mt-2">
                Please wait for the model training to complete before generating images.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/tunes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Models
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Generate Headshots</h1>
        <Badge className="bg-green-100 text-green-800">Ready</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the style and setting for your headshot (e.g., professional business attire, studio lighting, neutral background)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific about style, lighting, background, and attire for best results.
              </p>
            </div>

            <div>
              <Label htmlFor="numImages">Number of Images</Label>
              <Input
                id="numImages"
                type="number"
                min={1}
                max={8}
                value={numImages}
                onChange={(e) => setNumImages(parseInt(e.target.value) || 1)}
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Images
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Model Name</p>
              <p className="text-sm">{model.name || `Model ${model.id.toString().slice(-8)}`}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Model ID</p>
              <p className="text-sm">{model.modelid}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-sm">{new Date(model.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Badge className="bg-green-100 text-green-800">{model.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                  <img 
                    src={imageUrl} 
                    alt={`Generated headshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneratePage;
