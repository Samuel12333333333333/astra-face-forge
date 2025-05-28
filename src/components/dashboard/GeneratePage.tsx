
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GeneratePage = () => {
  const { tuneId } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Generate Headshots</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Using Model {tuneId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Generation interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratePage;
