import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Sparkles, Eye, ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TuneDetails {
  id: number;
  name: string | null;
  status: string;
  modelid: string | null;
  created_at: string;
  type: string | null;
  user_id: string | null;
}

const TuneOverviewPage = () => {
  const { tuneId } = useParams(); // This is actually the modelid from the URL
  const [tune, setTune] = useState<TuneDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTuneDetails();
  }, [tuneId]);

  const loadTuneDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Query by modelid since that's what we get from the URL parameter
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('modelid', tuneId) // Use modelid instead of id
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setTune(data);
    } catch (error: any) {
      console.error('Error loading tune details:', error);
      toast.error('Failed to load model details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tune) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Model Not Found</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">The requested model could not be found.</p>
            <Link to="/dashboard/tunes">
              <Button className="mt-4">Back to My Models</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/tunes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Models
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {tune.name || `Model ${tune.id.toString().slice(-8)}`}
          </h1>
          <Badge className={getStatusColor(tune.status)}>
            {tune.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          {tune.status === 'completed' && tune.modelid && (
            <>
              <Link to={`/dashboard/tunes/${tune.modelid}/generate`}>
                <Button className="bg-brand-600 hover:bg-brand-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </Link>
              <Link to={`/dashboard/tunes/${tune.modelid}/gallery`}>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Gallery
                </Button>
              </Link>
            </>
          )}
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Training Images</CardTitle>
              <CardDescription>
                Images used to train this AI model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Model ID</p>
                <p className="text-sm">{tune.modelid || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm">{new Date(tune.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-sm">{tune.type || 'Standard'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge className={getStatusColor(tune.status)}>
                  {tune.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {tune.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={`/dashboard/tunes/${tune.modelid}/generate`}>
                  <Button className="w-full bg-brand-600 hover:bg-brand-700">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate New Images
                  </Button>
                </Link>
                <Link to={`/dashboard/tunes/${tune.modelid}/gallery`}>
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View All Generated Images
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TuneOverviewPage;
