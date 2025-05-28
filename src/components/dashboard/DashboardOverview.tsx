
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { 
  Camera, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Image, 
  Calendar,
  Download,
  Share2
} from "lucide-react";
import ReactionsGallery from "@/components/reactions/ReactionsGallery";
import BrandKit from "@/components/brandkit/BrandKit";
import VisualTimeline from "@/components/timeline/VisualTimeline";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalHeadshots: 0,
    totalModels: 0,
    profileViews: 0,
    recentActivity: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [recentHeadshot, setRecentHeadshot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load models count
      const { data: models, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', user.id);

      if (modelsError) throw modelsError;

      // Load images count  
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .in('modelid', models?.map(m => m.id) || []);

      if (imagesError) throw imagesError;

      // Get most recent headshot for demos
      if (images && images.length > 0) {
        setRecentHeadshot({
          url: images[images.length - 1].uri,
          theme: 'boardroom-bold'
        });
      }

      setStats({
        totalHeadshots: images?.length || 0,
        totalModels: models?.length || 0,
        profileViews: Math.floor(Math.random() * 500) + 100, // Mock data
        recentActivity: [
          { type: 'headshot', message: 'Generated new Boardroom Bold headshot', time: '2 hours ago' },
          { type: 'profile', message: 'Profile viewed 12 times today', time: '4 hours ago' },
          { type: 'download', message: 'Brand kit downloaded', time: '1 day ago' }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'reactions', label: 'Reactions Gallery', icon: Users },
    { id: 'brand-kit', label: 'Brand Kit', icon: Download },
    { id: 'timeline', label: 'Visual Timeline', icon: Calendar }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Brand Dashboard</h1>
          <p className="text-gray-600">Manage your AI-powered personal brand</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/dashboard/generate">
            <Button className="bg-brand-600 hover:bg-brand-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Headshots</p>
                    <p className="text-2xl font-bold">{stats.totalHeadshots}</p>
                  </div>
                  <Camera className="h-8 w-8 text-brand-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Models</p>
                    <p className="text-2xl font-bold">{stats.totalModels}</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold">{stats.profileViews}</p>
                    <p className="text-sm text-green-600">+12% this week</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Brand Score</p>
                    <p className="text-2xl font-bold">8.9</p>
                    <p className="text-sm text-blue-600">Excellent</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">★</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your personal brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/dashboard/generate">
                  <Button variant="outline" className="w-full justify-start">
                    <Image className="mr-2 h-4 w-4" />
                    Generate New Headshots
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('brand-kit')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Brand Kit
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reactions')}>
                  <Users className="mr-2 h-4 w-4" />
                  View Reactions Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Your Brand Story
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest brand activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-brand-600 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'reactions' && (
        <ReactionsGallery 
          headshotUrl={recentHeadshot?.url || '/placeholder.svg?height=400&width=400'}
          theme={recentHeadshot?.theme || 'professional'}
          userProfile={{}}
        />
      )}

      {activeTab === 'brand-kit' && (
        <BrandKit 
          headshotUrl={recentHeadshot?.url || '/placeholder.svg?height=400&width=400'}
          theme={recentHeadshot?.theme || 'professional'}
          userProfile={{}}
        />
      )}

      {activeTab === 'timeline' && (
        <VisualTimeline />
      )}
    </div>
  );
};

export default DashboardOverview;
