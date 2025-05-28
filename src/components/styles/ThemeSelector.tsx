import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Sparkles, Crown, Palette, Target } from "lucide-react";

interface ThemeSelectorProps {
  onThemeSelected: (themeId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  userProfile?: {
    goals: string[];
    industry: string;
    personality: string;
    usage: string[];
  };
}

interface Theme {
  id: string;
  name: string;
  description: string;
  features: string[];
  recommended: string[];
  industries: string[];
  icon: any;
  gradient: string;
  popular?: boolean;
}

interface ThemeWithScore extends Theme {
  score: number;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onThemeSelected,
  onBack,
  onContinue,
  userProfile
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const themes: Theme[] = [
    {
      id: 'boardroom-bold',
      name: 'Boardroom Bold',
      description: 'Commanding executive presence with sharp, confident styling',
      features: ['Power suit styling', 'Executive lighting', 'Corporate backdrop', 'Authority posture'],
      recommended: ['job-hunting', 'networking', 'thought-leader'],
      industries: ['Finance & Banking', 'Consulting', 'Legal'],
      icon: Crown,
      gradient: 'from-slate-900 to-slate-700',
      popular: true
    },
    {
      id: 'creative-edge',
      name: 'Creative Edge',
      description: 'Artistic flair with innovative styling for creative professionals',
      features: ['Artistic lighting', 'Creative backgrounds', 'Unique angles', 'Color-rich styling'],
      recommended: ['speaking', 'thought-leader'],
      industries: ['Creative & Design', 'Media & Entertainment'],
      icon: Palette,
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'minimalist-pro',
      name: 'Minimalist Pro',
      description: 'Clean, sophisticated approach with timeless appeal',
      features: ['Clean aesthetics', 'Neutral tones', 'Soft lighting', 'Timeless styling'],
      recommended: ['job-hunting', 'networking'],
      industries: ['Technology & Software', 'Healthcare & Medical'],
      icon: Target,
      gradient: 'from-gray-600 to-gray-400'
    },
    {
      id: 'startup-visionary',
      name: 'Startup Visionary',
      description: 'Innovation-focused styling for entrepreneurs and founders',
      features: ['Modern casual', 'Tech-forward backdrop', 'Dynamic poses', 'Innovation vibe'],
      recommended: ['entrepreneurship', 'speaking'],
      industries: ['Technology & Software', 'Entrepreneurship'],
      icon: Sparkles,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'warm-connector',
      name: 'Warm Connector',
      description: 'Approachable and trustworthy for relationship-building',
      features: ['Warm lighting', 'Friendly expressions', 'Natural settings', 'Approachable styling'],
      recommended: ['dating', 'networking'],
      industries: ['Education', 'Healthcare & Medical', 'Real Estate'],
      icon: Target,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'industry-influencer',
      name: 'Industry Influencer',
      description: 'Thought leadership presence for media and speaking',
      features: ['Media-ready styling', 'Professional backdrop', 'Confident posture', 'Premium quality'],
      recommended: ['thought-leader', 'speaking'],
      industries: ['Marketing & PR', 'Consulting'],
      icon: Crown,
      gradient: 'from-emerald-600 to-teal-600'
    }
  ];

  // Filter themes based on user profile
  const getRecommendedThemes = (): ThemeWithScore[] => {
    if (!userProfile) return themes.map(theme => ({ ...theme, score: 0 }));
    
    return themes.map(theme => ({
      ...theme,
      score: calculateRecommendationScore(theme)
    })).sort((a, b) => b.score - a.score);
  };

  const calculateRecommendationScore = (theme: Theme) => {
    let score = 0;
    
    // Check goal alignment
    const goalMatches = theme.recommended.filter((rec: string) => 
      userProfile?.goals.includes(rec)
    ).length;
    score += goalMatches * 3;
    
    // Check industry alignment
    if (theme.industries.includes(userProfile?.industry || '')) {
      score += 2;
    }
    
    return score;
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeSelected(themeId);
  };

  const handleContinue = () => {
    if (!selectedTheme) return;
    onContinue();
  };

  const recommendedThemes = getRecommendedThemes();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Brand Theme</h1>
          <p className="text-gray-600">Select the theme that best matches your personal brand goals</p>
        </div>
      </div>

      {userProfile && (
        <Card className="bg-gradient-to-r from-brand-50 to-brand-100 border-brand-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-brand-900 mb-2">Personalized Recommendations</h3>
            <p className="text-sm text-brand-700">
              Based on your goals ({userProfile.goals.join(', ')}) and industry ({userProfile.industry})
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedThemes.map((theme, index) => {
          const Icon = theme.icon;
          const isRecommended = userProfile && theme.score > 0;
          
          return (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTheme === theme.id
                  ? 'ring-2 ring-brand-600 border-brand-600 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.gradient} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    {theme.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                    {isRecommended && (
                      <Badge className="bg-brand-600 text-xs">
                        Recommended
                      </Badge>
                    )}
                    {selectedTheme === theme.id && (
                      <Check className="h-5 w-5 text-brand-600" />
                    )}
                  </div>
                </div>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className={`aspect-video bg-gradient-to-br ${theme.gradient} rounded-lg mb-4 flex items-center justify-center`}>
                  <span className="text-white font-medium">Theme Preview</span>
                </div>
                
                <ul className="space-y-1">
                  {theme.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {isRecommended && (
                  <div className="mt-3 p-2 bg-brand-50 rounded text-xs text-brand-700">
                    Perfect for: {theme.recommended.filter(rec => userProfile?.goals.includes(rec)).join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedTheme}
          size="lg"
          className="bg-brand-600 hover:bg-brand-700"
        >
          Continue to Photo Upload
        </Button>
      </div>
    </div>
  );
};

export default ThemeSelector;
