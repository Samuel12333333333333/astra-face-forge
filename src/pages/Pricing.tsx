
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Perfect for trying out AI headshots",
      features: [
        "1 AI model training",
        "50 generated images",
        "Basic support",
        "HD quality images"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "month",
      description: "Best for professionals and content creators",
      features: [
        "5 AI model trainings",
        "200 generated images",
        "Priority support",
        "4K quality images",
        "Custom styles",
        "Bulk downloads"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For teams and businesses",
      features: [
        "Unlimited AI model trainings",
        "1000 generated images",
        "24/7 premium support",
        "4K quality images",
        "Custom styles",
        "API access",
        "Team management",
        "Custom branding"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your AI headshot needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-brand-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Already have an account?
          </p>
          <Link to="/auth/login">
            <Button variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
