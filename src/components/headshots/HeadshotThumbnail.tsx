
import React from "react";

interface HeadshotThumbnailProps {
  url: string;
  index: number;
  isSelected: boolean;
  onSelect: (url: string) => void;
}

const HeadshotThumbnail: React.FC<HeadshotThumbnailProps> = ({
  url,
  index,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(url)}
      className={`aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 ${
        isSelected ? 'border-brand-600' : 'border-transparent'
      }`}
    >
      <img 
        src={url} 
        alt={`Headshot ${index + 1}`} 
        className="object-cover w-full h-full"
        onError={(e) => {
          console.error("Thumbnail load error");
          e.currentTarget.src = "https://via.placeholder.com/100?text=Error";
        }} 
      />
    </button>
  );
};

export default HeadshotThumbnail;
