
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MultiUploadSectionProps {
  onPhotosUploaded?: (files: File[], modelName: string) => void;
  onContinue?: () => void;
}

const MultiUploadSection: React.FC<MultiUploadSectionProps> = ({ 
  onPhotosUploaded, 
  onContinue 
}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [modelName, setModelName] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    
    if (files.length + selectedFiles.length > 12) {
      toast.error("Maximum 12 photos allowed");
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generate previews
    const newPreviews = [...previews];
    selectedFiles.forEach((file, index) => {
      if (file && file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const previewIndex = files.length + index;
            newPreviews[previewIndex] = e.target.result as string;
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (selectedFiles.length > 0) {
      toast.success(`${selectedFiles.length} photos added`);
    }
  }, [files, previews]);

  const removeFile = (index: number) => {
    if (index >= 0 && index < files.length) {
      const newFiles = files.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      setFiles(newFiles);
      setPreviews(newPreviews);
      toast.success("Photo removed");
    }
  };

  const startTraining = async () => {
    if (files.length < 5) {
      toast.error("Please upload at least 5 photos for best results");
      return;
    }
    if (!modelName.trim()) {
      toast.error("Please enter a model name");
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to start training');
        return;
      }

      // Convert images to base64
      const imageData: string[] = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        if (base64) imageData.push(base64);
      }

      const { data, error } = await supabase.functions.invoke('astria', {
        body: {
          action: 'create-tune-with-images',
          images: imageData,
          name: modelName.trim()
        }
      });

      if (error) throw error;

      if (data?.id) {
        toast.success('Training started! Check your dashboard for progress.');
        navigate('/dashboard/tunes');
      }
    } catch (error: any) {
      toast.error(`Training failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('File reading failed'));
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Training Photos</CardTitle>
          <CardDescription>
            Upload 5-12 high-quality photos of yourself for AI model training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              placeholder="e.g., John Business Headshots V1"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Photos ({files.length}/12)</Label>
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={files.length >= 12}
              >
                <Upload className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </div>

            {files.length === 0 ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-brand-500 transition-colors"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your photos</h3>
                <p className="text-gray-500">
                  Click here to select photos. Use clear, well-lit photos with good facial visibility.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => {
                  if (!preview || index >= files.length) return null;
                  
                  return (
                    <div key={`preview-${index}`} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use high-resolution photos (minimum 512x512 pixels)</li>
              <li>• Include variety: different angles, expressions, and lighting</li>
              <li>• Ensure good lighting and sharp focus</li>
              <li>• Avoid sunglasses, hats, or heavy filters</li>
              <li>• Include some close-up face shots and some upper body shots</li>
            </ul>
          </div>

          <Button 
            onClick={startTraining}
            disabled={files.length < 5 || !modelName.trim() || isUploading}
            className="w-full bg-brand-600 hover:bg-brand-700"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting Training...
              </>
            ) : (
              <>
                Start AI Training ({files.length} photos)
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiUploadSection;
