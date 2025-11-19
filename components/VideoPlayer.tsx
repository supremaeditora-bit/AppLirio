import React from 'react';

interface VideoPlayerProps {
  url: string;
}

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.hostname.includes('youtu.be')
        ? urlObj.pathname.slice(1)
        : urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&autoplay=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
      }
    }

    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Fallback for any other embeddable URL
    return url;

  } catch (error) {
    // Handle cases where the input is not a full URL but maybe just an ID
    // YouTube ID
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
        return `https://www.youtube.com/embed/${url}?rel=0&controls=1&autoplay=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
    }
    console.warn("Invalid URL for VideoPlayer:", url, error);
    return null;
  }
};


const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const embedUrl = getEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <div className="aspect-video w-full bg-verde-mata rounded-xl flex items-center justify-center">
        <p className="text-creme-velado/70 font-sans">URL do vídeo inválida ou não suportada.</p>
      </div>
    );
  }
  
  return (
    <div className="aspect-video w-full">
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="Player de Vídeo Incorporado"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-xl shadow-lg"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
