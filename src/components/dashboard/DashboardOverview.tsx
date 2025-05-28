
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Share2,
  Crown,
  Target,
  Palette,
  ArrowRight,
  Star,
  Zap,
  Award,
  Eye,
  Heart,
  MessageCircle
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
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  };

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
        profileViews: Math.floor(Math.random() * 500) + 100,
        recentActivity: [
          { type: 'headshot', message: 'Generated new Boardroom Bold headshot', time: '2 hours ago', icon: Camera },
          { type: 'profile', message: 'Profile viewed 12 times today', time: '4 hours ago', icon: Eye },
          { type: 'download', message: 'Brand kit downloaded', time: '1 day ago', icon: Download }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate journey progress
  const getJourneyProgress = () => {
    const steps = [
      { name: 'Profile Setup', completed: !!userProfile },
      { name: 'Photos Uploaded', completed: stats.totalModels > 0 },
      { name: 'AI Model Trained', completed: stats.totalModels > 0 },
      { name: 'Headshots Generated', completed: stats.totalHeadshots > 0 }
    ];
    const completedSteps = steps.filter(step => step.completed).length;
    return { steps, progress: (completedSteps / steps.length) * 100 };
  };

  const recommendedStyles = [
    {
      id: 'boardroom-bold',
      name: 'Boardroom Bold',
      description: 'Executive presence',
      gradient: 'from-slate-900 to-slate-700',
      icon: Crown,
      popular: true
    },
    {
      id: 'creative-edge',
      name: 'Creative Edge',
      description: 'Artistic flair',
      gradient: 'from-purple-600 to-pink-600',
      icon: Palette
    },
    {
      id: 'startup-visionary',
      name: 'Startup Visionary',
      description: 'Innovation-focused',
      gradient: 'from-blue-600 to-cyan-600',
      icon: Zap
    },
    {
      id: 'minimalist-pro',
      name: 'Minimalist Pro',
      description: 'Clean & sophisticated',
      gradient: 'from-gray-600 to-gray-400',
      icon: Target
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Brand Hub', icon: TrendingUp },
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

  const { steps, progress } = getJourneyProgress();

  return (
    <div className="space-y-6">
      {/* Welcome Header with Progress */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
            <p className="text-brand-100">Your AI personal brand is evolving beautifully</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <div className="text-sm text-brand-100">Journey Complete</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-brand-100">
            <span>Brand Journey Progress</span>
            <span>{steps.filter(s => s.completed).length} of {steps.length} completed</span>
          </div>
          <Progress value={progress} className="bg-brand-800" />
          <div className="flex justify-between text-xs text-brand-200">
            {steps.map((step, index) => (
              <span key={index} className={step.completed ? 'text-white font-medium' : ''}>
                {step.completed ? '✓' : '○'} {step.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-lg p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center space-x-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Professional Headshots</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalHeadshots}</p>
                    <p className="text-xs text-blue-600 mt-1">Ready to impress</p>
                  </div>
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">AI Models</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalModels}</p>
                    <p className="text-xs text-purple-600 mt-1">Trained & ready</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Profile Views</p>
                    <p className="text-3xl font-bold text-green-900">{stats.profileViews}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% this week
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Brand Score</p>
                    <p className="text-3xl font-bold text-amber-900">9.2</p>
                    <p className="text-xs text-amber-600 mt-1 flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Exceptional
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle>AI Recommendations</CardTitle>
              </div>
              <CardDescription className="text-indigo-100">
                Personalized suggestions to elevate your brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🎯 Perfect for LinkedIn</h4>
                  <p className="text-sm text-indigo-100 mb-3">
                    Generate a "Boardroom Bold" headshot - 73% more engagement for {userProfile?.industry || 'your industry'}
                  </p>
                  <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                    Generate Now
                  </Button>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">📸 Style Experiment</h4>
                  <p className="text-sm text-indigo-100 mb-3">
                    Try "Creative Edge" - perfect for {userProfile?.goals?.includes('speaking') ? 'speaking engagements' : 'networking events'}
                  </p>
                  <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                    Explore Style
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Styles Carousel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Trending Styles</h2>
              <Link to="/dashboard/generate">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {recommendedStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <Card key={style.id} className="group hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`aspect-square bg-gradient-to-br ${style.gradient} rounded-lg mb-3 flex items-center justify-center relative overflow-hidden`}>
                        <Icon className="h-8 w-8 text-white" />
                        {style.popular && (
                          <Badge className="absolute top-2 right-2 bg-white text-gray-900 text-xs">
                            Popular
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                            Try Style
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900">{style.name}</h3>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Your latest brand building moments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Power up your personal brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/dashboard/generate">
                  <Button className="w-full justify-start bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800">
                    <Camera className="mr-3 h-4 w-4" />
                    Generate New Headshots
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('brand-kit')}>
                  <Download className="mr-3 h-4 w-4" />
                  Download Brand Kit
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reactions')}>
                  <Users className="mr-3 h-4 w-4" />
                  View Reactions Analysis
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="mr-3 h-4 w-4" />
                  Share Your Brand Story
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'reactions' && (
        <ReactionsGallery 
          headshotUrl={recentHeadshot?.url || '/placeholder.svg?height=400&width=400'}
          theme={recentHeadshot?.theme || 'professional'}
          userProfile={userProfile || {}}
        />
      )}

      {activeTab === 'brand-kit' && (
        <BrandKit 
          headshotUrl={recentHeadshot?.url || '/placeholder.svg?height=400&width=400'}
          theme={recentHeadshot?.theme || 'professional'}
          userProfile={userProfile || {}}
        />
      )}

      {activeTab === 'timeline' && (
        <VisualTimeline />
      )}
    </div>
  );
};

export default DashboardOverview;
