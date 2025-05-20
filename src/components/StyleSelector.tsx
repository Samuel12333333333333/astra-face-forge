
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Briefcase, Camera, Palette, SparkleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const styleOptions: StyleOption[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Business attire with formal backgrounds",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "casual",
    name: "Casual",
    description: "Relaxed style for everyday contexts",
    icon: <Camera className="h-5 w-5" />,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Artistic style for creative professionals",
    icon: <Palette className="h-5 w-5" />,
  },
];

interface StyleSelectorProps {
  onStyleSelected: (styleId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ onStyleSelected, onBack, onContinue }) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    onStyleSelected(styleId);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="mb-2">Choose Your Headshot Style</h2>
        <p className="text-muted-foreground">Select a style that best represents your professional image</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {styleOptions.map((style) => (
          <Card 
            key={style.id}
            className={cn(
              "border-2 cursor-pointer transition-all hover:border-brand-400 hover:shadow-md",
              selectedStyle === style.id ? "border-brand-500 ring-2 ring-brand-500/20" : "border-border"
            )}
            onClick={() => handleStyleSelect(style.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                selectedStyle === style.id ? "bg-brand-100 text-brand-600" : "bg-muted text-muted-foreground"
              )}>
                {style.icon}
              </div>
              <h4 className="font-medium mb-2">{style.name}</h4>
              <p className="text-sm text-muted-foreground">{style.description}</p>
              
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2">
                  <SparkleIcon className="h-5 w-5 text-brand-500 animate-pulse-slow" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button disabled={!selectedStyle} onClick={onContinue}>
          Generate Headshots <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StyleSelector;
