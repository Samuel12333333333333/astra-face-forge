
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About AI Headshots Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing professional photography with AI technology, 
            making high-quality headshots accessible to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                To democratize professional photography by providing AI-powered headshot generation 
                that's affordable, fast, and produces studio-quality results. We believe everyone 
                deserves to present their best professional self.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-brand-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Advanced AI technology trained on millions of professional photos
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-brand-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Get professional headshots in minutes, not weeks
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-brand-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Everyone</h3>
            <p className="text-gray-600">
              Perfect for professionals, job seekers, and teams
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-brand-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">
              Your photos are secure and never shared without permission
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-brand-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Photos</h3>
                <p className="text-gray-600">
                  Upload 5-20 photos of yourself from different angles
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-brand-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Training</h3>
                <p className="text-gray-600">
                  Our AI learns your unique features in 20-30 minutes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-brand-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate</h3>
                <p className="text-gray-600">
                  Create unlimited professional headshots instantly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-brand-600 text-white max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-brand-100 mb-6">
                Join thousands of professionals who have transformed their online presence
              </p>
              <Link to="/">
                <Button size="lg" className="bg-white text-brand-600 hover:bg-gray-100">
                  Create Your Headshots
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
