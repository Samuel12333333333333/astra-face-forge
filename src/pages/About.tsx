
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: Camera,
      title: "AI-Powered Training",
      description: "Upload just 5+ photos and let our advanced AI learn your unique features to create stunning professional headshots."
    },
    {
      icon: Sparkles,
      title: "Multiple Styles",
      description: "Generate headshots in various professional styles - from corporate to creative, we have the perfect look for every need."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get your AI model trained in just 20-30 minutes and generate unlimited professional headshots instantly."
    },
    {
      icon: Users,
      title: "Professional Quality",
      description: "Studio-quality results without the studio cost. Perfect for LinkedIn, resumes, company websites, and more."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional AI Headshots
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your photos into stunning professional headshots using cutting-edge AI technology. 
              No photographer needed, no studio required.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/auth/register">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AI Headshots?
            </h2>
            <p className="text-lg text-gray-600">
              Create professional headshots in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get professional headshots in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Photos",
                description: "Upload 5+ clear photos of yourself from different angles"
              },
              {
                step: "2",
                title: "AI Training",
                description: "Our AI learns your unique features in just 20-30 minutes"
              },
              {
                step: "3",
                title: "Generate Headshots",
                description: "Create unlimited professional headshots in various styles"
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-brand-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-brand-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Professional Headshots?
          </h2>
          <p className="text-xl text-brand-100 mb-8">
            Join thousands of professionals who trust AI Headshots for their professional image
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="bg-white text-brand-600 hover:bg-gray-100">
              Start Creating Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
