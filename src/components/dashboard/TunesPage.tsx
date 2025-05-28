
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, Sparkles, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tune {
  id: string;
  name: string;
  status: string;
  modelid: string;
  created_at: string;
  type: string;
}

const TunesPage = () => {
  const [tunes, setTunes] = useState<Tune[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTunes();
  }, []);

  const loadTunes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTunes(data || []);
    } catch (error: any) {
      console.error('Error loading tunes:', error);
      toast.error('Failed to load your AI models');
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Ready';
      case 'processing':
        return 'Training';
      case 'training':
        return 'Training';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My AI Models</h1>
        <Link to="/">
          <Button className="bg-brand-600 hover:bg-brand-700">
            <Plus className="mr-2 h-4 w-4" />
            Train New Model
          </Button>
        </Link>
      </div>

      {tunes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI models yet</h3>
            <p className="text-gray-500 mb-6">Get started by training your first AI model</p>
            <Link to="/">
              <Button className="bg-brand-600 hover:bg-brand-700">
                <Plus className="mr-2 h-4 w-4" />
                Train Your First Model
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tunes.map((tune) => (
            <Card key={tune.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {tune.name || `Model ${tune.id.slice(-8)}`}
                  </CardTitle>
                  <Badge className={getStatusColor(tune.status)}>
                    {getStatusText(tune.status)}
                  </Badge>
                </div>
                <CardDescription>
                  Created {new Date(tune.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tune.status === 'completed' && (
                    <>
                      <Link to={`/dashboard/tunes/${tune.modelid}/generate`}>
                        <Button className="w-full bg-brand-600 hover:bg-brand-700">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Headshots
                        </Button>
                      </Link>
                      <Link to={`/dashboard/tunes/${tune.modelid}/gallery`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Gallery
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {tune.status === 'processing' && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Training in progress...</p>
                    </div>
                  )}
                  
                  {tune.status === 'failed' && (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-600">Training failed</p>
                      <Link to="/">
                        <Button variant="outline" size="sm" className="mt-2">
                          Try Again
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TunesPage;
