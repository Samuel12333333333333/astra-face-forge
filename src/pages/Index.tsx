
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";

const Index = () => {
  const { user, loading } = useUser();

  // Redirect to dashboard if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

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

  // Redirect to auth if not logged in
  return <Navigate to="/auth/login" replace />;
};

export default Index;
