
import React, { useState } from "react";
import { FileInput } from "@/components/ui/file-input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadSectionProps {
  onPhotoUploaded: (file: File) => void;
  onContinue: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onPhotoUploaded, onContinue }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    
    // Generate preview for the uploaded file
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(newFile);
      
      // Notify parent component about the uploaded file
      onPhotoUploaded(newFile);
      toast.success("Photo uploaded successfully!");
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 flex flex-col items-center">
          <h3 className="text-xl font-medium text-center mb-6">Upload Your Photo</h3>
          
          {previewUrl ? (
            <div className="mb-6 w-full">
              <div className="relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Uploaded preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleFileChange(null)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 p-1 rounded-full text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full mb-6">
              <label 
                htmlFor="single-file-upload" 
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center mb-3">
                    <Camera className="h-8 w-8 text-brand-600" />
                  </div>
                  <p className="mb-2 text-sm text-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">Upload a clear photo with good lighting</p>
                </div>
                <input 
                  id="single-file-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    handleFileChange(selectedFile);
                  }}
                />
              </label>
            </div>
          )}
          
          <FileInput onValueChange={handleFileChange} />
          
          <div className="w-full mt-8">
            <Button 
              className="w-full bg-brand-600 hover:bg-brand-700"
              size="lg"
              disabled={!file}
              onClick={onContinue}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4 text-center">
            <p>For best results, use a clear photo with good lighting and a neutral background.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSection;
