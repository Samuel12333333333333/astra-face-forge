
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TuneDetailPage = () => {
  const { tuneId } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Model Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Model {tuneId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Model details and management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TuneDetailPage;
