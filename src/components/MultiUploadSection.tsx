
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MultiUploadSectionProps {
  onImagesUploaded: (files: File[]) => void;
  onContinue: () => void;
}

const MultiUploadSection: React.FC<MultiUploadSectionProps> = ({
  onImagesUploaded,
  onContinue
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles].slice(0, 20); // Max 20 files
      setUploadedFiles(newFiles);
      onImagesUploaded(newFiles);
      toast.success(`Added ${validFiles.length} image(s)`);
    }
  }, [uploadedFiles, onImagesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onImagesUploaded(newFiles);
  };

  const handleContinue = () => {
    if (uploadedFiles.length < 5) {
      toast.error("Please upload at least 5 images");
      return;
    }
    onContinue();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Training Images</CardTitle>
          <CardDescription>
            Upload 5-20 high-quality photos of yourself for the best results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-gray-500 mb-4">
              Support: JPG, PNG, WebP (max 10MB each)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">
                Uploaded Images ({uploadedFiles.length}/20)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {uploadedFiles.length >= 5 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm text-gray-600">
                {uploadedFiles.length >= 5 
                  ? "Ready to continue" 
                  : `${5 - uploadedFiles.length} more images needed`
                }
              </span>
            </div>
            <Button 
              onClick={handleContinue}
              disabled={uploadedFiles.length < 5}
              className="bg-brand-600 hover:bg-brand-700"
            >
              Continue to Training
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiUploadSection;
