
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw, Share2 } from "lucide-react";

interface HeadshotActionButtonsProps {
  onGenerate: () => void;
  onDownload: () => void;
  onShare: () => void;
  isGenerating: boolean;
  isDownloading: boolean;
  hasSelectedHeadshot: boolean;
}

const HeadshotActionButtons: React.FC<HeadshotActionButtonsProps> = ({
  onGenerate,
  onDownload,
  onShare,
  isGenerating,
  isDownloading,
  hasSelectedHeadshot
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating}
        className="bg-brand-600 hover:bg-brand-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate More
          </>
        )}
      </Button>
      
      <Button 
        onClick={onDownload} 
        disabled={!hasSelectedHeadshot || isDownloading}
        variant="outline"
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download
      </Button>
      
      <Button 
        onClick={onShare} 
        disabled={!hasSelectedHeadshot}
        variant="outline"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
};

export default HeadshotActionButtons;
