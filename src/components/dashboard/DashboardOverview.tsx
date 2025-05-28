
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, Sparkles, TrendingUp, Users, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardStats {
  totalModels: number;
  activeModels: number;
  processingModels: number;
  totalImages: number;
  recentModels: any[];
  recentImages: any[];
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    activeModels: 0,
    processingModels: 0,
    totalImages: 0,
    recentModels: [],
    recentImages: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // Load models data
      const { data: models, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (modelsError) {
        console.error('Error loading models:', modelsError);
        throw modelsError;
      }

      // Load images data
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select(`
          *,
          models!inner(user_id)
        `)
        .eq('models.user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (imagesError) {
        console.error('Error loading images:', imagesError);
        // Don't throw here, images might not exist yet
      }

      const allModels = models || [];
      const allImages = images || [];
      
      const activeModels = allModels.filter(m => m.status === 'completed');
      const processingModels = allModels.filter(m => m.status === 'processing' || m.status === 'training');
      
      setStats({
        totalModels: allModels.length,
        activeModels: activeModels.length,
        processingModels: processingModels.length,
        totalImages: allImages.length,
        recentModels: allModels.slice(0, 5),
        recentImages: allImages.slice(0, 4)
      });

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'training':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your AI models</p>
        </div>
        <Link to="/train">
          <Button className="bg-brand-600 hover:bg-brand-700">
            <Plus className="mr-2 h-4 w-4" />
            Train New Model
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModels}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalModels === 0 ? 'No models yet' : 'All time'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeModels}</div>
            <p className="text-xs text-muted-foreground">Ready to generate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingModels}</div>
            <p className="text-xs text-muted-foreground">Training in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Images</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">Total created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Models</CardTitle>
            <CardDescription>Your latest AI model training activities</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentModels.length > 0 ? (
              <div className="space-y-4">
                {stats.recentModels.map((model: any) => (
                  <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {model.name || `Model ${model.id.toString().slice(-8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created {getTimeAgo(model.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      {model.status === 'completed' && model.modelid && (
                        <Link to={`/dashboard/tunes/${model.modelid}/generate`}>
                          <Button size="sm" variant="outline">
                            <Sparkles className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                <Link to="/dashboard/tunes">
                  <Button variant="outline" className="w-full">
                    View All Models
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-muted-foreground">No models yet</p>
                <Link to="/train">
                  <Button size="sm" className="mt-2">
                    Train Your First Model
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
            <CardDescription>Your latest generated images</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentImages.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {stats.recentImages.slice(0, 4).map((image: any) => (
                    <div key={image.id} className="aspect-square rounded-lg overflow-hidden border">
                      <img 
                        src={image.uri} 
                        alt="Generated headshot"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><Camera class="h-6 w-6" /></div>';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <Link to="/dashboard/gallery">
                  <Button variant="outline" className="w-full">
                    View All Images
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-muted-foreground">No images generated yet</p>
                {stats.activeModels > 0 ? (
                  <Link to="/dashboard/tunes">
                    <Button size="sm" className="mt-2">
                      Generate Images
                    </Button>
                  </Link>
                ) : (
                  <Link to="/train">
                    <Button size="sm" className="mt-2">
                      Train a Model First
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
