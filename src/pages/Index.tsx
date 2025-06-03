
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  const { user, loading } = useUser();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional AI Headshots
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Transform your photos into professional headshots using AI. 
            Upload your photos, train a custom model, and generate stunning results.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/auth/login">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Camera className="h-12 w-12 text-brand-600 mb-4" />
              <CardTitle>Upload Photos</CardTitle>
              <CardDescription>
                Upload 5-20 high-quality photos of yourself from different angles
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Sparkles className="h-12 w-12 text-brand-600 mb-4" />
              <CardTitle>AI Training</CardTitle>
              <CardDescription>
                Our AI learns your unique features to create personalized headshots
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <ArrowRight className="h-12 w-12 text-brand-600 mb-4" />
              <CardTitle>Generate Results</CardTitle>
              <CardDescription>
                Create professional headshots with custom prompts and styles
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
