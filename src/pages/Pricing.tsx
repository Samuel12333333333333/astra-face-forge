
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$19",
      period: "one-time",
      description: "Perfect for getting started with AI headshots",
      features: [
        "Train 1 AI model",
        "Generate 50 headshots",
        "Basic styles",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$49",
      period: "one-time",
      description: "Best for professionals and job seekers",
      features: [
        "Train 3 AI models",
        "Generate 200 headshots",
        "All styles included",
        "Priority support",
        "High-resolution downloads"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "$99",
      period: "one-time",
      description: "For teams and businesses",
      features: [
        "Train unlimited models",
        "Generate 500 headshots",
        "Custom styles",
        "24/7 support",
        "Commercial license",
        "Team management"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your professional headshot needs. 
            One-time payment, lifetime access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? 'border-brand-600 shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-brand-600 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-brand-600 hover:bg-brand-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            All plans include a 30-day money-back guarantee
          </p>
          <p className="text-sm text-gray-500">
            Need something custom? <Link to="/support" className="text-brand-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
