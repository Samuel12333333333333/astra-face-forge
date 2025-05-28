
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Camera, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimelineEntry {
  id: string;
  date: string;
  theme: string;
  headshotUrl: string;
  goals: string[];
  metrics?: {
    profileViews: number;
    connectionRequests: number;
    engagement: number;
  };
}

const VisualTimeline: React.FC = () => {
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real implementation, this would fetch from a timeline table
      // For now, we'll use mock data
      const mockTimeline: TimelineEntry[] = [
        {
          id: '1',
          date: '2024-01-15',
          theme: 'boardroom-bold',
          headshotUrl: '/placeholder.svg?height=200&width=200',
          goals: ['job-hunting', 'networking'],
          metrics: {
            profileViews: 245,
            connectionRequests: 12,
            engagement: 8.5
          }
        },
        {
          id: '2',
          date: '2024-02-28',
          theme: 'creative-edge',
          headshotUrl: '/placeholder.svg?height=200&width=200',
          goals: ['speaking', 'thought-leader'],
          metrics: {
            profileViews: 189,
            connectionRequests: 8,
            engagement: 6.2
          }
        },
        {
          id: '3',
          date: '2024-03-10',
          theme: 'startup-visionary',
          headshotUrl: '/placeholder.svg?height=200&width=200',
          goals: ['entrepreneurship', 'networking'],
          metrics: {
            profileViews: 324,
            connectionRequests: 18,
            engagement: 9.1
          }
        }
      ];

      setTimelineEntries(mockTimeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeDisplayName = (themeId: string) => {
    const themeMap: { [key: string]: string } = {
      'boardroom-bold': 'Boardroom Bold',
      'creative-edge': 'Creative Edge',
      'startup-visionary': 'Startup Visionary',
      'minimalist-pro': 'Minimalist Pro',
      'warm-connector': 'Warm Connector',
      'industry-influencer': 'Industry Influencer'
    };
    return themeMap[themeId] || themeId;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visual Evolution</h2>
          <p className="text-gray-600">Track your personal brand journey over time</p>
        </div>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share Journey
        </Button>
      </div>

      {timelineEntries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Timeline Yet</h3>
                <p className="text-gray-600">Create your first headshot to start tracking your evolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Headshots</p>
                    <p className="text-2xl font-bold">{timelineEntries.length}</p>
                  </div>
                  <Camera className="h-8 w-8 text-brand-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold">
                      {timelineEntries[timelineEntries.length - 1]?.metrics?.profileViews || 0}
                    </p>
                    {timelineEntries.length > 1 && (
                      <p className="text-sm text-green-600">
                        +{calculateGrowth(
                          timelineEntries[timelineEntries.length - 1]?.metrics?.profileViews || 0,
                          timelineEntries[timelineEntries.length - 2]?.metrics?.profileViews || 0
                        )}% from last
                      </p>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Engagement Score</p>
                    <p className="text-2xl font-bold">
                      {timelineEntries[timelineEntries.length - 1]?.metrics?.engagement || 0}/10
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-600 font-bold text-sm">★</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            <div className="space-y-6">
              {timelineEntries.map((entry, index) => (
                <div key={entry.id} className="relative flex items-start space-x-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center relative z-10">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  
                  <Card className="flex-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{getThemeDisplayName(entry.theme)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {entry.goals.map((goal) => (
                            <Badge key={goal} variant="secondary" className="text-xs">
                              {goal.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={entry.headshotUrl} 
                            alt={`${entry.theme} headshot`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {entry.metrics && (
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900">
                                {entry.metrics.profileViews}
                              </p>
                              <p className="text-sm text-gray-600">Profile Views</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900">
                                {entry.metrics.connectionRequests}
                              </p>
                              <p className="text-sm text-gray-600">Connections</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900">
                                {entry.metrics.engagement}
                              </p>
                              <p className="text-sm text-gray-600">Engagement</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualTimeline;
