
import React from "react";
import HeadshotThumbnail from "./HeadshotThumbnail";

interface HeadshotGalleryProps {
  headshots: string[];
  selectedHeadshot: string | null;
  onSelectHeadshot: (url: string) => void;
}

const HeadshotGallery: React.FC<HeadshotGalleryProps> = ({
  headshots,
  selectedHeadshot,
  onSelectHeadshot
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {headshots.slice(0, 8).map((url, index) => (
        <HeadshotThumbnail
          key={index}
          url={url}
          index={index}
          isSelected={url === selectedHeadshot}
          onSelect={onSelectHeadshot}
        />
      ))}
    </div>
  );
};

export default HeadshotGallery;
