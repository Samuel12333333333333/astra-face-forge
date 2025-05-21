
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Upload, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface MultiUploadSectionProps {
  onImagesUploaded: (imageIds: string[]) => void;
  onContinue: () => void;
}

const MultiUploadSection: React.FC<MultiUploadSectionProps> = ({ 
  onImagesUploaded, 
  onContinue 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const MIN_REQUIRED_IMAGES = 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Show a warning if too many files are selected
      if (selectedFiles.length > 20) {
        toast.warning("You've selected more than 20 images. Only the first 20 will be used.");
      }
      
      // Limit to 20 files
      const limitedFiles = selectedFiles.slice(0, 20);
      setFiles(limitedFiles);
      
      // Generate preview images
      const newPreviews: string[] = [];
      limitedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            if (newPreviews.length === limitedFiles.length) {
              setPreviewImages(newPreviews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one image");
      toast.error("Please select at least one image");
      return;
    }

    if (files.length < MIN_REQUIRED_IMAGES) { 
      setError(`Please upload at least ${MIN_REQUIRED_IMAGES} images for optimal AI training results`);
      toast.error(`Please upload at least ${MIN_REQUIRED_IMAGES} images for optimal AI training results`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadedCount(0);
    setUploadedImageIds([]);
    const imageIds: string[] = [];

    try {
      console.log("Starting upload of", files.length, "images");
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading image ${i+1}/${files.length}: ${file.name} (${file.type}, ${file.size} bytes)`);
        
        if (!file || file.size === 0) {
          console.error(`Skipping empty file at index ${i}`);
          continue;
        }
        
        try {
          // Convert file to base64
          const base64Data = await fileToBase64(file);
          
          // Call the Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('astria', {
            body: {
              action: 'upload-images',
              image: base64Data,
              filename: file.name,
              contentType: file.type
            }
          });
          
          if (error) {
            throw new Error(`Error invoking function: ${error.message}`);
          }
          
          console.log(`Image ${i+1} upload response:`, data);
          
          if (data && data.id) {
            imageIds.push(data.id);
            setUploadedCount(prev => prev + 1);
            console.log(`Successfully uploaded image ${i+1}, received ID: ${data.id}`);
          } else {
            throw new Error(`Missing ID in response for image ${i+1}`);
          }
        } catch (uploadError: any) {
          console.error(`Upload error for image ${i+1}:`, uploadError);
          toast.error(`Error uploading image ${i+1}`, { description: uploadError.message });
        }
      }

      if (imageIds.length > 0) {
        if (imageIds.length < MIN_REQUIRED_IMAGES) {
          const missingCount = MIN_REQUIRED_IMAGES - imageIds.length;
          setError(`Only ${imageIds.length} images were successfully uploaded. Need ${missingCount} more to meet the minimum of ${MIN_REQUIRED_IMAGES}.`);
          toast.error(`Upload more images`, { description: `Only ${imageIds.length} images were successfully uploaded. Need ${missingCount} more.` });
        } else {
          setUploadedImageIds(imageIds);
          onImagesUploaded(imageIds);
          toast.success(`Successfully uploaded ${imageIds.length} out of ${files.length} images`);
        }
      } else {
        setError("Failed to upload any images. Please try again.");
        toast.error("Failed to upload any images. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(`Error uploading images: ${error.message}`);
      toast.error(`Error uploading images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  // Helper function to convert File object to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
    
    // Clear any existing upload success since we modified the file list
    if (uploadedImageIds.length > 0) {
      setUploadedImageIds([]);
      toast.info("Files changed. You'll need to upload again.");
    }
    
    setError(null);
  };

  const uploadProgress = files.length > 0 ? Math.round((uploadedCount / files.length) * 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 flex flex-col items-center">
          <h3 className="text-xl font-medium text-center mb-6">Upload Your Photos</h3>
          
          <div className="w-full mb-6">
            <label 
              htmlFor="multi-file-input" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-brand-600" />
                <p className="mb-2 text-sm text-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Upload {MIN_REQUIRED_IMAGES}-20 selfies (JPG, PNG)</p>
              </div>
              <input 
                id="multi-file-input" 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
          
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {previewImages.length > 0 && (
            <div className="w-full mb-6">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">{files.length} images selected {files.length < MIN_REQUIRED_IMAGES && (
                  <span className="text-red-500">
                    (Need at least {MIN_REQUIRED_IMAGES})
                  </span>
                )}</p>
                {!uploading && (
                  <button 
                    onClick={() => {
                      setFiles([]);
                      setPreviewImages([]);
                      setUploadedImageIds([]);
                      setError(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {previewImages.slice(0, 8).map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded overflow-hidden">
                    <img 
                      src={preview} 
                      alt={`Preview ${index+1}`} 
                      className="w-full h-full object-cover" 
                    />
                    {!uploading && (
                      <button 
                        onClick={() => handleRemoveFile(index)} 
                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full hover:bg-black/80"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
                {files.length > 8 && (
                  <div className="aspect-square rounded bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{files.length - 8} more</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {uploading && (
            <div className="w-full mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadedCount}/{files.length}</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex flex-col w-full gap-2">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full bg-brand-600 hover:bg-brand-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Uploading
                </>
              ) : uploadedImageIds.length >= MIN_REQUIRED_IMAGES ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {uploadedImageIds.length} Images Uploaded Successfully
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photos
                </>
              )}
            </Button>
            
            <Button 
              className="w-full"
              onClick={onContinue}
              disabled={uploadedImageIds.length < MIN_REQUIRED_IMAGES}
              variant={uploadedImageIds.length >= MIN_REQUIRED_IMAGES ? "default" : "outline"}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4 text-center">
            <p>For best results, upload {MIN_REQUIRED_IMAGES}-20 clear photos with good lighting and different facial expressions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiUploadSection;
