
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";

interface StyleSelectorProps {
  onStyleSelected: (styleId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const styles = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate look perfect for LinkedIn and resumes',
    features: ['Business attire', 'Neutral background', 'Professional lighting'],
    popular: true
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed and approachable for social media profiles',
    features: ['Casual clothing', 'Natural setting', 'Soft lighting']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic and unique for creative portfolios',
    features: ['Artistic styling', 'Creative backgrounds', 'Dramatic lighting']
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Executive-level headshots for leadership profiles',
    features: ['Formal attire', 'Executive styling', 'Premium backgrounds']
  }
];

const StyleSelector: React.FC<StyleSelectorProps> = ({
  onStyleSelected,
  onBack,
  onContinue
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    onStyleSelected(styleId);
  };

  const handleContinue = () => {
    if (!selectedStyle) return;
    onContinue();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Style</h1>
          <p className="text-gray-600">Select the style that best fits your needs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {styles.map((style) => (
          <Card
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedStyle === style.id
                ? 'ring-2 ring-brand-600 border-brand-600'
                : 'border-gray-200'
            }`}
            onClick={() => handleStyleSelect(style.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>{style.name}</span>
                  {style.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </CardTitle>
                {selectedStyle === style.id && (
                  <Check className="h-5 w-5 text-brand-600" />
                )}
              </div>
              <CardDescription>{style.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Style Preview</span>
              </div>
              <ul className="space-y-1">
                {style.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedStyle}
          size="lg"
          className="bg-brand-600 hover:bg-brand-700"
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  );
};

export default StyleSelector;
