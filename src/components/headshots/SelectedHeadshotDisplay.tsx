
import React from "react";

interface SelectedHeadshotDisplayProps {
  imageUrl: string | null;
}

const SelectedHeadshotDisplay: React.FC<SelectedHeadshotDisplayProps> = ({ imageUrl }) => {
  if (!imageUrl) {
    return null;
  }
  
  return (
    <div className="aspect-square w-full max-w-md mb-4 rounded-lg overflow-hidden border">
      <img 
        src={imageUrl} 
        alt="Selected AI Headshot" 
        className="object-cover w-full h-full" 
        onError={(e) => {
          console.error("Image load error");
          e.currentTarget.src = "https://via.placeholder.com/400?text=Image+Load+Error";
        }}
      />
    </div>
  );
};

export default SelectedHeadshotDisplay;
