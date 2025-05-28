
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Briefcase, Mic, Heart, Building, Users } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (data: {
    goals: string[];
    industry: string;
    personality: string;
    usage: string[];
  }) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState("");
  const [selectedUsage, setSelectedUsage] = useState<string[]>([]);

  const goals = [
    { id: 'job-hunting', label: 'Land My Dream Job', icon: Briefcase, description: 'Professional headshots for career advancement' },
    { id: 'speaking', label: 'Speaking Engagements', icon: Mic, description: 'Authority-building portraits for conferences' },
    { id: 'dating', label: 'Dating & Social', icon: Heart, description: 'Attractive, authentic photos for dating apps' },
    { id: 'networking', label: 'Business Networking', icon: Users, description: 'Professional portraits for industry events' },
    { id: 'entrepreneurship', label: 'Startup Founder', icon: Building, description: 'Visionary leader headshots for pitches' },
    { id: 'thought-leader', label: 'Thought Leadership', icon: Target, description: 'Influential portraits for media appearances' }
  ];

  const industries = [
    'Technology & Software', 'Finance & Banking', 'Healthcare & Medical',
    'Creative & Design', 'Marketing & PR', 'Consulting', 'Real Estate',
    'Education', 'Legal', 'Entrepreneurship', 'Media & Entertainment'
  ];

  const personalities = [
    { id: 'bold', label: 'Bold & Confident', description: 'Strong, commanding presence' },
    { id: 'approachable', label: 'Warm & Approachable', description: 'Friendly, trustworthy vibe' },
    { id: 'creative', label: 'Creative & Artistic', description: 'Innovative, expressive style' },
    { id: 'minimalist', label: 'Clean & Minimalist', description: 'Simple, sophisticated look' },
    { id: 'dynamic', label: 'Dynamic & Energetic', description: 'Active, engaging presence' }
  ];

  const usageOptions = [
    'LinkedIn Profile', 'Company Website', 'Speaking Events', 'Dating Apps',
    'Social Media', 'Business Cards', 'Press Kit', 'Portfolio'
  ];

  const steps = [
    {
      title: "What's Your Goal?",
      description: "Let's understand what you want to achieve with your personal brand",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <Card
                key={goal.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-brand-600 border-brand-600' : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelectedGoals(prev => 
                    prev.includes(goal.id) 
                      ? prev.filter(g => g !== goal.id)
                      : [...prev, goal.id]
                  );
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-6 w-6 mt-1 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-medium">{goal.label}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )
    },
    {
      title: "What's Your Industry?",
      description: "This helps us understand your professional context",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {industries.map((industry) => (
            <Button
              key={industry}
              variant={selectedIndustry === industry ? "default" : "outline"}
              className={`justify-start h-auto p-4 ${
                selectedIndustry === industry ? 'bg-brand-600 hover:bg-brand-700' : ''
              }`}
              onClick={() => setSelectedIndustry(industry)}
            >
              {industry}
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "What's Your Vibe?",
      description: "Choose the personality that best represents you",
      content: (
        <div className="space-y-3">
          {personalities.map((personality) => (
            <Card
              key={personality.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPersonality === personality.id ? 'ring-2 ring-brand-600 border-brand-600' : 'border-gray-200'
              }`}
              onClick={() => setSelectedPersonality(personality.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{personality.label}</h3>
                    <p className="text-sm text-gray-600">{personality.description}</p>
                  </div>
                  {selectedPersonality === personality.id && (
                    <Badge className="bg-brand-600">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "Where Will You Use These?",
      description: "Select all platforms where you'll showcase your brand",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {usageOptions.map((usage) => (
            <Button
              key={usage}
              variant={selectedUsage.includes(usage) ? "default" : "outline"}
              className={`h-auto p-3 text-center ${
                selectedUsage.includes(usage) ? 'bg-brand-600 hover:bg-brand-700' : ''
              }`}
              onClick={() => {
                setSelectedUsage(prev => 
                  prev.includes(usage) 
                    ? prev.filter(u => u !== usage)
                    : [...prev, usage]
                );
              }}
            >
              {usage}
            </Button>
          ))}
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedGoals.length > 0;
      case 1: return selectedIndustry !== "";
      case 2: return selectedPersonality !== "";
      case 3: return selectedUsage.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        goals: selectedGoals,
        industry: selectedIndustry,
        personality: selectedPersonality,
        usage: selectedUsage
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-lg">{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
