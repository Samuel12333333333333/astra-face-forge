
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Images, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecentActivity {
  id: number;
  uri: string;
  created_at: string;
  modelid: number;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalTunes: 0,
    readyTunes: 0,
    totalGenerations: 0,
    recentActivity: [] as RecentActivity[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get tunes count
      const { data: tunes, error: tunesError } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', user.id);

      if (tunesError) throw tunesError;

      const readyTunes = tunes?.filter(tune => tune.status === 'completed').length || 0;

      // Get total generations count from images table
      let totalGenerations = 0;
      if (tunes && tunes.length > 0) {
        const tuneIds = tunes.map(tune => tune.id);
        const { data: images, error: imagesError } = await supabase
          .from('images')
          .select('id')
          .in('modelid', tuneIds);

        if (imagesError) throw imagesError;
        totalGenerations = images?.length || 0;
      }

      // Get recent activity (latest generated images)
      let recentActivity: RecentActivity[] = [];
      if (tunes && tunes.length > 0) {
        const tuneIds = tunes.map(tune => tune.id);
        const { data: recentImages, error: recentError } = await supabase
          .from('images')
          .select('id, uri, created_at, modelid')
          .in('modelid', tuneIds)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentError) throw recentError;
        recentActivity = recentImages || [];
      }

      setStats({
        totalTunes: tunes?.length || 0,
        readyTunes,
        totalGenerations,
        recentActivity
      });
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/">
          <Button className="bg-brand-600 hover:bg-brand-700">
            <Plus className="mr-2 h-4 w-4" />
            Upload & Train New Headshot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tunes</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTunes}</div>
            <p className="text-xs text-muted-foreground">
              AI models trained
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGenerations}</div>
            <p className="text-xs text-muted-foreground">
              Professional headshots created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready Models</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.readyTunes}</div>
            <p className="text-xs text-muted-foreground">
              Ready to generate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest headshot generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Images className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No generated images yet</p>
                  <p className="text-sm text-gray-400">Start by training a model and generating your first headshots</p>
                </div>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={activity.uri} 
                          alt="Generated headshot"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Generated Image
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Model ID: {activity.modelid}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-medium">
                            Generated
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your AI headshots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Train New AI Model
              </Button>
            </Link>
            <Link to="/dashboard/tunes" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                View My Models
              </Button>
            </Link>
            {stats.readyTunes > 0 && (
              <Link to="/dashboard/tunes" className="block">
                <Button className="w-full justify-start bg-brand-600 hover:bg-brand-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Headshots
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
