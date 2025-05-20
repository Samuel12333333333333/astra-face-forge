
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    if (files.length < 3) { // Lower minimum requirement for testing
      toast.error("Please upload at least 3 images for best results");
      return;
    }

    setUploading(true);
    setUploadedCount(0);
    const imageIds: string[] = [];

    try {
      console.log("Starting upload of", files.length, "images");
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading image ${i+1}/${files.length}: ${file.name} (${file.type}, ${file.size} bytes)`);
        
        try {
          // Direct binary upload of each file
          const { data, error } = await supabase.functions.invoke('astria/upload-images', {
            body: await file.arrayBuffer(),
            headers: {
              'Content-Type': file.type || 'image/jpeg',
            }
          });
          
          if (error) {
            console.error(`Error uploading image ${i+1}:`, error);
            toast.error(`Error uploading image ${i+1}: ${error.message}`);
            continue;
          }
          
          console.log(`Image ${i+1} upload response:`, data);
          
          if (data && data.id) {
            imageIds.push(data.id);
            setUploadedCount(prev => prev + 1);
            console.log(`Successfully uploaded image ${i+1}, got ID: ${data.id}`);
          } else {
            throw new Error(`Missing ID in response for image ${i+1}`);
          }
        } catch (uploadError: any) {
          console.error(`Upload error for image ${i+1}:`, uploadError);
        }
      }

      if (imageIds.length > 0) {
        setUploadedImageIds(imageIds);
        onImagesUploaded(imageIds);
        toast.success(`Successfully uploaded ${imageIds.length} out of ${files.length} images`);
      } else {
        toast.error("Failed to upload any images. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Error uploading images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

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
                <svg className="w-8 h-8 mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Upload 3-20 selfies (JPG, PNG)</p>
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
          
          {files.length > 0 && (
            <div className="w-full mb-4">
              <p className="mb-2 text-sm">{files.length} images selected</p>
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-brand-600 h-2.5 rounded-full" 
                    style={{ width: `${(uploadedCount / files.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col w-full gap-2">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full"
            >
              {uploading ? `Uploading... (${uploadedCount}/${files.length})` : "Upload Photos"}
            </Button>
            
            <Button 
              className="w-full"
              onClick={onContinue}
              disabled={uploadedImageIds.length === 0}
              variant="outline"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4 text-center">
            <p>For best results, upload 3-20 clear photos with good lighting and different facial expressions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiUploadSection;
