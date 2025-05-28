
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, Sparkles, TrendingUp, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/contexts/UserContext";
import { useModels } from "@/hooks/useModels";
import { useImages } from "@/hooks/useImages";

const DashboardOverview = () => {
  const { user } = useUser();
  const { data: models = [], isLoading: modelsLoading, error: modelsError } = useModels();
  const { data: images = [], isLoading: imagesLoading, error: imagesError } = useImages();

  const isLoading = modelsLoading || imagesLoading;
  const hasError = modelsError || imagesError;

  // Calculate stats from real data
  const totalModels = models.length;
  const activeModels = models.filter(m => m.status === 'completed').length;
  const processingModels = models.filter(m => m.status === 'processing' || m.status === 'training').length;
  const totalImages = images.length;

  // Create recent activity from real data
  const recentActivity = [
    ...models.slice(0, 3).map(model => ({
      type: 'model',
      action: `Model ${model.status}`,
      name: model.name || `Model ${model.id.toString().slice(-8)}`,
      timestamp: model.created_at,
      status: model.status
    })),
    ...images.slice(0, 3).map(image => ({
      type: 'image',
      action: 'Image generated',
      name: 'New image',
      timestamp: image.created_at,
      status: 'completed'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{totalModels}</div>
            <p className="text-xs text-muted-foreground">
              {totalModels === 0 ? 'No models yet' : 'All time'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModels}</div>
            <p className="text-xs text-muted-foreground">Ready to generate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingModels}</div>
            <p className="text-xs text-muted-foreground">Training in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Images</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImages}</div>
            <p className="text-xs text-muted-foreground">Total created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/train" className="block">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Train New Model
                </Button>
              </Link>
              <Link to="/dashboard/tunes" className="block">
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  View My Models
                </Button>
              </Link>
              {activeModels > 0 && (
                <Link to="/dashboard/generate" className="block">
                  <Button variant="outline" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Images
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.name} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-muted-foreground">No recent activity</p>
                <Link to="/train">
                  <Button size="sm" className="mt-2">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
