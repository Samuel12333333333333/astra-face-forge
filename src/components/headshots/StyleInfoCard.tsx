
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StyleInfoCardProps {
  selectedStyle: string | null;
  onBack: () => void;
}

const StyleInfoCard: React.FC<StyleInfoCardProps> = ({ selectedStyle, onBack }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Selected Style</h3>
        
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <p className="font-medium capitalize">
            {selectedStyle || "Default"} Style
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedStyle === 'professional' ? 
              'Professional lighting with neutral background' : 
              selectedStyle === 'casual' ? 
              'Natural lighting with casual setting' : 
              selectedStyle === 'creative' ? 
              'Artistic lighting with creative composition' : 
              'Standard headshot with good lighting'
            }
          </p>
        </div>
        
        <div className="mt-6 space-y-2">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Style
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleInfoCard;
