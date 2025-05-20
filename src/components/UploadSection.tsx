
import React, { useState } from "react";
import { FileInput } from "@/components/ui/file-input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface UploadSectionProps {
  onPhotoUploaded: (file: File) => void;
  onContinue: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onPhotoUploaded, onContinue }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      onPhotoUploaded(newFile);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 flex flex-col items-center">
          <h3 className="text-xl font-medium text-center mb-6">Upload Your Photo</h3>
          <FileInput onValueChange={handleFileChange} />
          
          <div className="w-full mt-8">
            <Button 
              className="w-full"
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
