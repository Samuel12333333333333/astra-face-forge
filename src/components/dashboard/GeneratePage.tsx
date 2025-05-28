
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
import { Loader2, Sparkles, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Model {
  id: number;
  name: string | null;
  modelid: string | null;
  status: string;
  created_at: string;
  user_id: string;
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
      if (!user) {
        toast.error('Please sign in to access this model');
        return;
      }

      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('modelid', tuneId)
        .single();

      if (error) throw error;

      // STRICT ENFORCEMENT: Model access check
      if (data.user_id !== user.id) {
        toast.error("Unauthorized model access");
        throw new Error("Unauthorized model access");
      }

      setModel(data);
    } catch (error: any) {
      console.error('Error loading model:', error);
      toast.error('Failed to load model details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!model) return;

    // STRICT ENFORCEMENT: Model must be completed
    if (model.status !== 'completed') {
      toast.error("Model is still training. Wait for it to complete before generating headshots.");
      return;
    }

    // STRICT ENFORCEMENT: Prompt validation
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || trimmedPrompt.length < 10) {
      toast.error('Please enter a descriptive prompt (minimum 10 characters)');
      return;
    }

    // STRICT ENFORCEMENT: Image count validation
    const imageCount = Math.max(1, Math.min(numImages, 8));
    if (imageCount !== numImages) {
      toast.error('Image count must be between 1 and 8');
      return;
    }

    setIsGenerating(true);
    try {
      console.log("Generating headshots with", {
        modelid: model.modelid,
        prompt: trimmedPrompt,
        count: imageCount,
        status: model.status
      });

      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'generate-headshots',
          tuneId: model.modelid,
          prompt: trimmedPrompt,
          numImages: imageCount
        }
      });

      if (error) {
        console.error('Generation error:', error);
        throw error;
      }

      if (data?.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        toast.success(`Generated ${data.images.length} headshots successfully!`);
      } else {
        throw new Error('No images returned. Try rewording your prompt for better results.');
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
            <p className="text-gray-500">The requested model could not be found or you don't have access to it.</p>
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
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Model Not Ready</h3>
                <p className="text-gray-600 mb-2">
                  Model is currently: <Badge variant="secondary">{model.status}</Badge>
                </p>
                <p className="text-sm text-gray-500">
                  You cannot generate headshots until the model training is completed. 
                  Training typically takes 15-25 minutes.
                </p>
              </div>
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
              <Label htmlFor="prompt">Prompt (minimum 10 characters)</Label>
              <Textarea
                id="prompt"
                placeholder="Professional business portrait, smiling, soft natural light, white backdrop, suit and tie"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                minLength={10}
              />
              <p className="text-sm text-gray-500 mt-1">
                Describe the style and setting: Include lighting, background, attire, and pose details.
                Current length: {prompt.trim().length}/10 minimum
              </p>
            </div>

            <div>
              <Label htmlFor="numImages">Number of Images (1-8)</Label>
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
              disabled={isGenerating || prompt.trim().length < 10 || numImages < 1 || numImages > 8}
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
                  Generate {numImages} Headshots
                </>
              )}
            </Button>

            {prompt.trim().length < 10 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm">
                  ⚠️ Prompt too short. Need {10 - prompt.trim().length} more characters for best results.
                </p>
              </div>
            )}
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
            <CardTitle>Generated Headshots</CardTitle>
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
