
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Copy, Image, FileText, Palette } from "lucide-react";
import { toast } from "sonner";

interface BrandKitProps {
  headshotUrl: string;
  theme: string;
  userProfile?: any;
}

const BrandKit: React.FC<BrandKitProps> = ({
  headshotUrl,
  theme,
  userProfile
}) => {
  const [personalQuote, setPersonalQuote] = useState("Innovation starts with believing in what's possible.");
  const [brandColors, setBrandColors] = useState({
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#f59e0b"
  });

  const kitItems = [
    {
      id: 'profile-square',
      name: 'Profile Photo (Square)',
      description: 'Perfect for LinkedIn, Twitter, and social media profiles',
      size: '400x400',
      type: 'image',
      icon: Image
    },
    {
      id: 'cover-banner',
      name: 'LinkedIn Cover Banner',
      description: 'Professional header for your LinkedIn profile',
      size: '1584x396',
      type: 'image',
      icon: Image
    },
    {
      id: 'business-card',
      name: 'Digital Business Card',
      description: 'Shareable contact card with your headshot',
      size: '500x300',
      type: 'image',
      icon: FileText
    },
    {
      id: 'quote-overlay',
      name: 'Inspirational Quote Card',
      description: 'Your headshot with personal quote overlay',
      size: '1080x1080',
      type: 'image',
      icon: FileText
    },
    {
      id: 'email-signature',
      name: 'Email Signature',
      description: 'Professional email signature with your photo',
      size: '600x200',
      type: 'image',
      icon: FileText
    },
    {
      id: 'speaker-bio',
      name: 'Speaker Bio Card',
      description: 'Event-ready speaker introduction card',
      size: '800x600',
      type: 'image',
      icon: FileText
    }
  ];

  const generateBrandKit = async () => {
    toast.success("Brand kit generation started! This may take a few moments...");
    
    // In a real implementation, this would call an AI service to generate the kit
    setTimeout(() => {
      toast.success("Brand kit ready for download!");
    }, 3000);
  };

  const downloadItem = (itemId: string) => {
    // In a real implementation, this would download the generated asset
    toast.success(`Downloading ${kitItems.find(item => item.id === itemId)?.name}...`);
  };

  const shareKit = () => {
    const shareUrl = `${window.location.origin}/brand-kit/shared/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Brand kit link copied to clipboard!");
  };

  const copyColors = () => {
    const colorString = `Primary: ${brandColors.primary}, Secondary: ${brandColors.secondary}, Accent: ${brandColors.accent}`;
    navigator.clipboard.writeText(colorString);
    toast.success("Brand colors copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brand Kit</h2>
          <p className="text-gray-600">Complete social media assets based on your headshot</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={shareKit} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Kit
          </Button>
          <Button onClick={generateBrandKit} className="bg-brand-600 hover:bg-brand-700">
            <Download className="mr-2 h-4 w-4" />
            Generate Full Kit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Customization */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Brand Customization
            </CardTitle>
            <CardDescription>Personalize your brand assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Personal Quote
              </label>
              <Textarea
                value={personalQuote}
                onChange={(e) => setPersonalQuote(e.target.value)}
                placeholder="Enter your inspirational quote..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Brand Colors
              </label>
              <div className="space-y-2">
                {Object.entries(brandColors).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: value }}
                    />
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => setBrandColors(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={copyColors}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                <Copy className="mr-2 h-3 w-3" />
                Copy Colors
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kit Items */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kitItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-brand-600" />
                        <h3 className="font-medium">{item.name}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.size}
                      </Badge>
                    </div>
                    
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-center">
                        <Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Preview</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    
                    <Button
                      onClick={() => downloadItem(item.id)}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Your Brand Kit</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use the square profile photo for all social media platforms</li>
            <li>• Update your LinkedIn cover banner to stand out to recruiters</li>
            <li>• Share quote cards on social media to build thought leadership</li>
            <li>• Include your email signature in all professional communications</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandKit;
