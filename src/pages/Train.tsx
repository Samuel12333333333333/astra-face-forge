
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import MultiUploadSection from "@/components/MultiUploadSection";

const Train = () => {
  const { user, loading } = useUser();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Train Your AI Model
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload 5-20 high-quality photos to create your personalized AI headshot model
          </p>
        </div>
        
        <MultiUploadSection 
          onContinue={() => {
            // Navigate to dashboard after successful training
            window.location.href = '/dashboard/tunes';
          }}
        />
      </div>
    </div>
  );
};

export default Train;
