
import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  onValueChange?: (file: File | null) => void;
  value?: File | null;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (onValueChange) {
        onValueChange(file);
      }
      
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    };

    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <Upload size={32} className="opacity-50" />
              <p className="mt-2 text-sm">No image selected</p>
            </div>
          )}
        </div>
        
        <Button 
          type="button"
          variant="outline"
          onClick={() => {
            const input = document.getElementById("file-input") as HTMLInputElement;
            if (input) input.click();
          }}
        >
          {previewUrl ? "Change Photo" : "Upload Photo"}
        </Button>
        
        <input
          type="file"
          id="file-input"
          ref={ref}
          onChange={handleChange}
          className="sr-only"
          accept="image/*"
          {...props}
        />
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
