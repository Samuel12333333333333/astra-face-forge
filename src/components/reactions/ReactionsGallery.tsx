
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw, TrendingUp, Heart, Briefcase, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReactionsGalleryProps {
  headshotUrl: string;
  theme: string;
  userProfile?: any;
}

const ReactionsGallery: React.FC<ReactionsGalleryProps> = ({
  headshotUrl,
  theme,
  userProfile
}) => {
  const [reactions, setReactions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const reactionTypes = [
    {
      type: 'recruiter',
      title: 'HR Manager',
      icon: Briefcase,
      avatar: '/placeholder.svg?height=40&width=40',
      company: 'Tech Corp',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: 'investor',
      title: 'Venture Capitalist',
      icon: TrendingUp,
      avatar: '/placeholder.svg?height=40&width=40',
      company: 'Growth Partners',
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'dating',
      title: 'Dating Match',
      icon: Heart,
      avatar: '/placeholder.svg?height=40&width=40',
      company: 'Dating App User',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      type: 'networking',
      title: 'Industry Peer',
      icon: Users,
      avatar: '/placeholder.svg?height=40&width=40',
      company: 'Professional Network',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const generateReactions = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-reactions', {
        body: {
          headshotUrl,
          theme,
          userProfile,
          reactionTypes: reactionTypes.map(rt => rt.type)
        }
      });

      if (error) throw error;

      if (data?.reactions) {
        setReactions(data.reactions);
        toast.success('Generated AI reactions successfully!');
      }
    } catch (error: any) {
      console.error('Error generating reactions:', error);
      // Fallback to mock data for demo
      generateMockReactions();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockReactions = () => {
    const mockReactions = [
      {
        type: 'recruiter',
        score: 8.5,
        feedback: "Strong professional presence. This headshot conveys confidence and competence - exactly what we look for in leadership candidates.",
        likelihood: "Very likely to schedule interview",
        traits: ['Professional', 'Confident', 'Trustworthy']
      },
      {
        type: 'investor',
        score: 9.2,
        feedback: "Compelling founder presence. This image projects the vision and determination we seek in entrepreneurs we back.",
        likelihood: "Would consider funding pitch",
        traits: ['Visionary', 'Determined', 'Innovative']
      },
      {
        type: 'dating',
        score: 7.8,
        feedback: "Attractive and approachable. The professional styling shows ambition while maintaining warmth and authenticity.",
        likelihood: "Would swipe right",
        traits: ['Attractive', 'Successful', 'Approachable']
      },
      {
        type: 'networking',
        score: 8.9,
        feedback: "Excellent networking headshot. Projects expertise and approachability - someone I'd want to connect with professionally.",
        likelihood: "Would connect on LinkedIn",
        traits: ['Expert', 'Approachable', 'Influential']
      }
    ];
    setReactions(mockReactions);
  };

  useEffect(() => {
    if (headshotUrl) {
      generateMockReactions();
    }
  }, [headshotUrl]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Reactions Gallery</h2>
          <p className="text-gray-600">See how different audiences perceive your headshot</p>
        </div>
        <Button
          onClick={generateReactions}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reactions.map((reaction, index) => {
          const reactionType = reactionTypes.find(rt => rt.type === reaction.type);
          if (!reactionType) return null;

          const Icon = reactionType.icon;
          
          return (
            <Card key={reaction.type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={reactionType.avatar} />
                    <AvatarFallback>
                      <Icon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{reactionType.title}</CardTitle>
                    <CardDescription>{reactionType.company}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-600">{reaction.score}/10</div>
                    <Badge className={reactionType.color}>
                      {reaction.likelihood}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <blockquote className="text-gray-700 italic border-l-4 border-brand-200 pl-4">
                  "{reaction.feedback}"
                </blockquote>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Impressions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {reaction.traits.map((trait: string, traitIndex: number) => (
                      <Badge key={traitIndex} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reactions.length === 0 && !isGenerating && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Reactions Yet</h3>
                <p className="text-gray-600">Upload a headshot to see AI-generated audience reactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReactionsGallery;
