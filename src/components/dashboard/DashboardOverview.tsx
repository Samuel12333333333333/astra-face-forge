
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Images, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalTunes: 3,
    readyTunes: 3,
    totalGenerations: 12,
    recentActivity: [
      {
        id: 1,
        prompt: "Professional corporate headshot in business attire",
        result: "Successful",
        timestamp: "12 minutes ago"
      },
      {
        id: 2,
        prompt: "Creative headshot with artistic lighting",
        result: "Successful", 
        timestamp: "12 minutes ago"
      },
      {
        id: 3,
        prompt: "Casual professional headshot for LinkedIn",
        result: "Successful",
        timestamp: "12 minutes ago"
      }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);

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

      setStats(prev => ({
        ...prev,
        totalTunes: tunes?.length || 0,
        readyTunes,
      }));
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
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">123</div>
            <p className="text-xs text-muted-foreground">
              This month
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
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Images className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Prompt:
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">
                          {activity.result}
                        </span>
                        <span className="text-xs text-gray-500">
                          ↓ {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
