import React, { useState } from 'react';
import { Announcement } from '../types';
import { CloseIcon, BellAlertIcon } from './Icons';

interface AnnouncementBannerProps {
  announcement: Announcement;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    // Optional: Could store dismissed announcement ID in localStorage to not show again
  };
  
  if (!isVisible) return null;

  return (
    <div className="bg-dourado-suave/20 text-marrom-seiva dark:bg-dourado-suave/10 dark:text-creme-velado p-3 flex items-center justify-center text-center text-sm font-semibold relative">
        <BellAlertIcon className="w-5 h-5 mr-3 flex-shrink-0" />
        <p>
            {announcement.message}
            {announcement.ctaText && announcement.ctaLink && (
                <a href={announcement.ctaLink} target="_blank" rel="noopener noreferrer" className="underline ml-2 hover:opacity-80">
                    {announcement.ctaText}
                </a>
            )}
        </p>
        <button onClick={handleDismiss} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-5 h-5" />
        </button>
    </div>
  );
};

export default AnnouncementBanner;
