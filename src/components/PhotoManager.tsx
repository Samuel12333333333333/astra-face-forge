
import React from "react";
import { X, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PhotoManagerProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  maxFiles?: number;
  className?: string;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  files,
  onRemove,
  onReorder,
  maxFiles = 12,
  className
}) => {
  const createPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <Card key={`${file.name}-${index}`} className="relative group overflow-hidden">
            <div className="aspect-square">
              <img
                src={createPreviewUrl(file)}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemove(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-white text-xs truncate">
                    {file.name}
                  </div>
                  <div className="text-white/70 text-xs">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {files.length} of {maxFiles} photos uploaded
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => files.forEach((_, index) => onRemove(index))}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
