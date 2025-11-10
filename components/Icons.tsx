
import React from 'react';
import {
    HomeIcon as HomeIconOutline,
    BookOpenIcon as BookOpenIconOutline,
    UsersIcon as UsersIconOutline,
    MicrophoneIcon as MicrophoneIconOutline,
    HeartIcon as HeartIconOutline,
    UserCircleIcon as UserCircleIconOutline,
    ArrowLeftOnRectangleIcon as LogoutIconOutline,
    PlayCircleIcon as PlayCircleIconOutline,
    Cog8ToothIcon as Cog8ToothIconOutline,
    SunIcon as SunIconOutline,
    MoonIcon as MoonIconOutline,
    MagnifyingGlassIcon as SearchIconOutline,
    BellIcon as BellIconOutline,
    Bars3Icon as MenuIconOutline,
    PlayIcon as PlayIconOutline,
    PlusIcon as PlusIconOutline,
    ChevronLeftIcon as ChevronLeftIconOutline,
    ChevronRightIcon as ChevronRightIconOutline,
    XMarkIcon as CloseIconOutline,
    ChatBubbleOvalLeftEllipsisIcon as ChatBubbleIconOutline,
    StarIcon as StarIconOutline,
    ChartPieIcon as ChartPieIconOutline,
    ShieldCheckIcon as ShieldCheckIconOutline,
    AcademicCapIcon as AcademicCapIconOutline,
    BellAlertIcon as BellAlertIconOutline,
    PencilIcon as PencilIconOutline,
    TrashIcon as TrashIconOutline,
    ShareIcon as ShareIconOutline,
    BookmarkIcon as BookmarkIconOutline,
    HandRaisedIcon as HandRaisedIconOutline, // Replacement for PrayingHandsIcon
    VideoCameraIcon as VideoCameraIconOutline, // NEW for Lives
    PaperAirplaneIcon as PaperAirplaneIconOutline, // NEW for sending messages
    CalendarDaysIcon as CalendarDaysIconOutline,
    CameraIcon as CameraIconOutline,
    MapPinIcon as MapPinIconOutline,
    HomeModernIcon as HomeModernIconOutline,
    ClockIcon as ClockIconOutline,
    PauseIcon as PauseIconOutline,
    ForwardIcon as ForwardIconOutline,
    BackwardIcon as BackwardIconOutline,
    ArrowDownTrayIcon as ArrowDownTrayIconOutline,
    PencilSquareIcon as PencilSquareIconOutline,
} from '@heroicons/react/24/outline';

import {
    HeartIcon as HeartIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    StarIcon as StarIconSolid,
    BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';


// Define props type for SVG icons to be reusable.
type IconProps = {
  className?: string;
  filled?: boolean;
};

// --- Heroicons Exports (maintaining original component names) ---

export const HomeIcon: React.FC<IconProps> = (props) => <HomeIconOutline {...props} />;
export const BookOpenIcon: React.FC<IconProps> = (props) => <BookOpenIconOutline {...props} />;
export const UsersIcon: React.FC<IconProps> = (props) => <UsersIconOutline {...props} />;
export const MicrophoneIcon: React.FC<IconProps> = (props) => <MicrophoneIconOutline {...props} />; // Used for Podcasts
export const UserCircleIcon: React.FC<IconProps> = (props) => <UserCircleIconOutline {...props} />;
export const LogoutIcon: React.FC<IconProps> = (props) => <LogoutIconOutline {...props} />;
export const PlayCircleIcon: React.FC<IconProps> = (props) => <PlayCircleIconOutline {...props} />;
export const Cog8ToothIcon: React.FC<IconProps> = (props) => <Cog8ToothIconOutline {...props} />;
export const SunIcon: React.FC<IconProps> = (props) => <SunIconOutline {...props} />;
export const MoonIcon: React.FC<IconProps> = (props) => <MoonIconOutline {...props} />;
export const SearchIcon: React.FC<IconProps> = (props) => <SearchIconOutline {...props} />;
export const BellIcon: React.FC<IconProps> = (props) => <BellIconOutline {...props} />;
export const MenuIcon: React.FC<IconProps> = (props) => <MenuIconOutline {...props} />;
export const PlayIcon: React.FC<IconProps> = (props) => <PlayIconOutline {...props} />;
export const PlusIcon: React.FC<IconProps> = (props) => <PlusIconOutline {...props} />;
export const ChevronLeftIcon: React.FC<IconProps> = (props) => <ChevronLeftIconOutline {...props} />;
export const ChevronRightIcon: React.FC<IconProps> = (props) => <ChevronRightIconOutline {...props} />;
export const CloseIcon: React.FC<IconProps> = (props) => <CloseIconOutline {...props} />;
export const ChatBubbleIcon: React.FC<IconProps> = (props) => <ChatBubbleIconOutline {...props} />;
export const ChartPieIcon: React.FC<IconProps> = (props) => <ChartPieIconOutline {...props} />;
export const ShieldCheckIcon: React.FC<IconProps> = (props) => <ShieldCheckIconOutline {...props} />;
export const AcademicCapIcon: React.FC<IconProps> = (props) => <AcademicCapIconOutline {...props} />;
export const BellAlertIcon: React.FC<IconProps> = (props) => <BellAlertIconOutline {...props} />;
export const PencilIcon: React.FC<IconProps> = (props) => <PencilIconOutline {...props} />;
export const TrashIcon: React.FC<IconProps> = (props) => <TrashIconOutline {...props} />;
export const ShareIcon: React.FC<IconProps> = (props) => <ShareIconOutline {...props} />;
export const PrayingHandsIcon: React.FC<IconProps> = (props) => <HandRaisedIconOutline {...props} />; // Using a consistent replacement
export const VideoCameraIcon: React.FC<IconProps> = (props) => <VideoCameraIconOutline {...props} />; // NEW
export const PaperAirplaneIcon: React.FC<IconProps> = (props) => <PaperAirplaneIconOutline {...props} />; // NEW
export const CalendarDaysIcon: React.FC<IconProps> = (props) => <CalendarDaysIconOutline {...props} />;
export const CameraIcon: React.FC<IconProps> = (props) => <CameraIconOutline {...props} />;
export const MapPinIcon: React.FC<IconProps> = (props) => <MapPinIconOutline {...props} />;
export const HomeModernIcon: React.FC<IconProps> = (props) => <HomeModernIconOutline {...props} />;
export const ClockIcon: React.FC<IconProps> = (props) => <ClockIconOutline {...props} />;
export const PauseIcon: React.FC<IconProps> = (props) => <PauseIconOutline {...props} />;
export const ForwardIcon: React.FC<IconProps> = (props) => <ForwardIconOutline {...props} />;
export const BackwardIcon: React.FC<IconProps> = (props) => <BackwardIconOutline {...props} />;
export const DownloadIcon: React.FC<IconProps> = (props) => <ArrowDownTrayIconOutline {...props} />;
export const JournalIcon: React.FC<IconProps> = (props) => <PencilSquareIconOutline {...props} />;


// --- Icons with Filled/Outline states ---

export const HeartIcon: React.FC<IconProps> = ({ filled, ...props }) => 
  filled ? <HeartIconSolid {...props} /> : <HeartIconOutline {...props} />;

export const StarIcon: React.FC<IconProps> = ({ filled, ...props }) =>
  filled ? <StarIconSolid {...props} /> : <StarIconOutline {...props} />;

export const BookmarkIcon: React.FC<IconProps> = ({ filled, ...props }) =>
  filled ? <BookmarkIconSolid {...props} /> : <BookmarkIconOutline {...props} />;

export const CheckCircleIcon: React.FC<IconProps> = (props) => <CheckCircleIconSolid {...props} />;

// --- Custom/Brand Icons (kept as SVG) ---
const Icon: React.FC<React.SVGProps<SVGSVGElement> & { className?: string }> = ({ className = 'w-6 h-6', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>{props.children}</svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8.003 8.003 0 0124 36c-4.418 0-8.002-3.582-8.002-8h-8C8 34.402 15.198 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.37 44 30.013 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export const InstagramIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </Icon>
);

export const FacebookIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </Icon>
);