import React from 'react';

interface VideoPlayerProps {
  youtubeId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId }) => {
  // Return null if no ID is provided to avoid rendering an empty iframe
  if (!youtubeId) {
    return null;
  }
  
  return (
    <div className="aspect-video w-full">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=0&disablekb=1&iv_load_policy=3&playsinline=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-xl shadow-lg"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;