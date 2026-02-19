






import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const UploadIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const WandIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28v1.28l1.28 1.28-1.28 1.28 1.28 1.28-1.28 1.28 1.28 1.28-1.28-1.28 1.28-1.28-1.28 1.28-1.28-1.28 1.28-1.28-1.28 1.28-1.28 1.28-1.28-1.28 1.28-1.28zm5.996 9.392l3.754 3.754a1.5 1.5 0 01-2.122 2.122l-3.753-3.754-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28-1.28-1.28-1.28-1.28 1.28-1.28-1.28 1.28zm3.004-6.388l-3.754-3.754a1.5 1.5 0 012.122-2.122l3.753 3.754-1.28 1.28-1.28-1.28 1.28 1.28 1.28-1.28-1.28 1.28-1.28 1.28-1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28 1.28-1.28-1.28-1.28z" />
  </svg>
);


export const DownloadIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const PaintBrushIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.73-.626 1.18-.748l3.576-.947a2.25 2.25 0 00.992-2.617l-1.528-4.585a2.25 2.25 0 00-2.617-.992l-4.585 1.528a2.25 2.25 0 00-.748 1.18l-3.03 2.496m-3.595 2.553l-3.468 3.468a2.25 2.25 0 000 3.182l2.35 2.35a2.25 2.25 0 003.182 0l3.468-3.468m0 0l-3.468-3.468" />
    </svg>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const EraserIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-1.125 8.25h-2.625a3.375 3.375 0 00-3.375 3.375v2.625a3.375 3.375 0 003.375 3.375h11.25a3.375 3.375 0 003.375-3.375v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5m-1.125-8.25v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.375 9.375l-3.375-3.375" />
    </svg>
  );
  
export const HistoryIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ZoomInIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
  </svg>
);

export const ZoomOutIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
  </svg>
);

export const ExpandIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

export const ShirtIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);

export const PoseIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L15 15.155M5.25 5.25l3.182 3.182a8.25 8.25 0 0111.667 0l3.182-3.182M5.25 5.25V3m0 2.25H3m2.25 0l-1.07 1.07M18.75 5.25l1.07 1.07M18.75 5.25v-2.25m0 2.25h2.25" />
    </svg>
);

export const LightingIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const RectangleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25-2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
);
  
export const LassoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.665 2.25A9.75 9.75 0 0120.415 12a9.75 9.75 0 01-9.75 9.75S4.75 21.75 4.75 12C4.75 6.44 8.25 2.25 10.665 2.25zM12 4.5a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0V5.25A.75.75 0 0112 4.5z" transform="rotate(15 12 12)" />
    </svg>
);

export const SelectionIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.464-1.464L13 18.75l1.188-.648a2.25 2.25 0 011.464-1.464L16.25 16.5l.648 1.188a2.25 2.25 0 011.464 1.464L19.5 18.75l-1.188.648a2.25 2.25 0 01-1.464 1.464z" />
    </svg>
);

export const UndoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);
  
export const RedoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
);

export const XIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const PencilIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const CropIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9.75v1.5A2.25 2.25 0 0118 20.25h-1.5m-9.75 0H6A2.25 2.25 0 013.75 18v-1.5" />
    </svg>
);

export const UpscaleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m-1.5 6l5.25 5.25m0 0v-4.5m0 4.5h-4.5M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15" />
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0 5.25-4.25 9.5-9.5 9.5S.5 17.25.5 12 4.75 2.5 10 2.5c2.563 0 4.888.99 6.688 2.613M19.5 5.25v4.5h-4.5" />
    </svg>
);

export const VideoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
);

export const SunIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

export const MoonIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

export const FlipIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L15 15.155M12 5.25v1.5m0 0V8.25m0-1.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0V6.75a1.5 1.5 0 011.5-1.5zm0 9.75v1.5m0 0v1.5m0-1.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0v-1.5a1.5 1.5 0 011.5-1.5zm0 9.75v1.5m0 0v1.5m0-1.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0v-1.5a1.5 1.5 0 011.5-1.5zM3.75 9.75h1.5m0 0h1.5m-1.5 0a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0v-1.5a1.5 1.5 0 011.5-1.5zm15 0h1.5m0 0h1.5m-1.5 0a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0v-1.5a1.5 1.5 0 011.5-1.5z" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
  
export const CircleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const StarIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

export const LayersIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.115A.998.998 0 005.117 6.113m1.455-1.455a.998.998 0 011.454 0m-1.454 0l1.454 1.455m-1.454-1.455L6.115 6.113m0 0A.998.998 0 015.117 5.115m0 0l-1.455 1.454m1.455-1.454a.998.998 0 000 1.454m-1.454 0L5.117 5.115" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6-9 6-9-6z" />
    </svg>
);

export const LibraryIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

export const PuzzleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.638 1.638 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.638 1.638 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0c.31 0 .555-.26.532-.57a48.039 48.039 0 01-.642-5.056c-1.518-.19-3.057-.309-4.616-.354a.64.64 0 01-.657.643v0z" />
    </svg>
);

export const SlidersIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);

export const SamsaraLogoLight: React.FC<IconProps> = (props) => (
    <svg {...props} id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 428.06 126.45">
      <g id="Layer_1-2" data-name="Layer 1">
        <g>
          <path fill="#231f20" d="M108.6,93.88l6.12-3.94c1.62,4.64,7.1,7.53,14.7,7.53,4.99,0,8.02-1.48,8.02-4.15,0-2.46-2.6-2.74-4.5-2.95l-10.13-1.12c-2.88-.35-10.97-1.2-10.97-8.58,0-6.47,6.19-10.41,16.6-10.41,6.75,0,13.01,1.69,16.18,4.57l-3.73,5.84c-3.66-2.6-8.16-4.01-13.01-4.01-4.29,0-6.75,1.27-6.75,3.52s2.74,2.67,4.29,2.81l9.85,1.05c3.52,.35,11.53,1.2,11.53,8.86,0,7.03-6.82,11.11-17.65,11.11s-18.29-4.01-20.54-10.13Z"/>
          <path fill="#231f20" d="M190.05,84.66v18.64h-9.42l.77-10.06-.49-.07c-1.83,6.61-8.09,10.83-16.6,10.83-7.17,0-11.46-2.88-11.46-8.3,0-4.57,3.09-7.03,10.13-8.3,5.13-.98,13.15-1.62,17.65-4.08-.21-4.36-3.52-6.75-9.14-6.75-7.03,0-11.11,3.87-9.21,8.79l-8.51,1.69c-3.59-9.49,4.64-16.81,17.58-16.81,11.25,0,18.71,5.49,18.71,14.42Zm-9.42,3.02v-1.27c-2.18,2.18-6.68,3.38-12.31,4.22-4.43,.63-6.05,1.62-6.05,3.73s1.76,3.31,5.34,3.31c7.1,0,13.01-4.43,13.01-9.99Z"/>
          <path fill="#231f20" d="M257.43,84.17v19.13h-9.71v-18.36c0-4.85-2.53-7.74-6.68-7.74-4.92,0-7.88,3.59-7.88,9.78v16.32h-9.63v-18.36c0-4.85-2.53-7.74-6.75-7.74-4.92,0-7.81,3.59-7.81,9.78v16.32h-9.49v-32.35h9.49l-.7,9.63,.49,.07c1.34-6.54,5.77-10.41,12.17-10.41s10.83,3.66,11.32,11.18l.56,.07c1.12-7.03,5.7-11.25,12.31-11.25,7.67,0,12.31,5.27,12.31,13.93Z"/>
          <path fill="#231f20" d="M263.76,93.88l6.12-3.94c1.62,4.64,7.1,7.53,14.7,7.53,4.99,0,8.02-1.48,8.02-4.15,0-2.46-2.6-2.74-4.5-2.95l-10.13-1.12c-2.88-.35-10.97-1.2-10.97-8.58,0-6.47,6.19-10.41,16.6-10.41,6.75,0,13.01,1.69,16.17,4.57l-3.73,5.84c-3.66-2.6-8.16-4.01-13.01-4.01-4.29,0-6.75,1.27-6.75,3.52s2.74,2.67,4.29,2.81l9.85,1.05c3.52,.35,11.53,1.2,11.53,8.86,0,7.03-6.82,11.11-17.65,11.11s-18.29-4.01-20.54-10.13Z"/>
          <path fill="#231f20" d="M345.21,84.66v18.64h-9.42l.77-10.06-.49-.07c-1.83,6.61-8.09,10.83-16.6,10.83-7.17,0-11.46-2.88-11.46-8.3,0-4.57,3.09-7.03,10.13-8.3,5.13-.98,13.15-1.62,17.65-4.08-.21-4.36-3.52-6.75-9.14-6.75-7.03,0-11.11,3.87-9.21,8.79l-8.51,1.69c-3.59-9.49,4.64-16.81,17.58-16.81,11.25,0,18.71,5.49,18.71,14.42Zm-9.42,3.02v-1.27c-2.18,2.18-6.68,3.38-12.31,4.22-4.43,.63-6.05,1.62-6.05,3.73s1.76,3.31,5.34,3.31c7.1,0,13.01-4.43,13.01-9.99Z"/>
          <path fill="#231f20" d="M380.8,91.63l-8.79-1.55c4.43-8.23,3.94-12.87-.7-12.87-4.29,0-7.17,4.08-7.17,10.34v15.75h-9.49v-32.35h9.49l-.7,9.63,.56,.07c1.55-6.47,5.98-10.41,12.17-10.41,9.14,0,11.18,8.65,4.64,21.38Z"/>
          <path fill="#231f20" d="M428.06,84.66v18.64h-9.42l.77-10.06-.49-.07c-1.83,6.61-8.09,10.83-16.6,10.83-7.17,0-11.46-2.88-11.46-8.3,0-4.57,3.09-7.03,10.13-8.3,5.13-.98,13.15-1.62,17.65-4.08-.21-4.36-3.52-6.75-9.14-6.75-7.03,0-11.11,3.87-9.21,8.79l-8.51,1.69c-3.59-9.49,4.64-16.81,17.58-16.81,11.25,0,18.71,5.49,18.71,14.42Zm-9.42,3.02v-1.27c-2.18,2.18-6.68,3.38-12.31,4.22-4.43,.63-6.05,1.62-6.05,3.73s1.76,3.31,5.34,3.31c7.1,0,13.01-4.43,13.01-9.99Z"/>
        </g>
        <circle fill="#F6EF12" cx="53.28" cy="66.1" r="53.28"/>
        <text style={{ fill: '#231f20', fontFamily: 'sans-serif', fontSize: '112.82px', fontWeight: 500 }} transform="translate(29.51 92.53) rotate(6.55) scale(.97 1)"><tspan x="0" y="0">8</tspan></text>
      </g>
    </svg>
);

export const SamsaraLogoDark: React.FC<IconProps> = (props) => (
  <svg {...props} id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 428.06 126.45">
    <g id="Layer_1-2" data-name="Layer 1">
        <g>
            <path fill="#F9F9F9" d="M108.6,93.88l6.12-3.94c1.62,4.64,7.1,7.53,14.7,7.53,4.99,0,8.02-1.48,8.02-4.15,0-2.46-2.6-2.74-4.5-2.95l-10.13-1.12c-2.88-.35-10.97-1.2-10.97-8.58,0-6.47,6.19-10.41,16.6-10.41,6.75,0,13.01,1.69,16.18,4.57l-3.73,5.84c-3.66-2.6-8.16-4.01-13.01-4.01-4.29,0-6.75,1.27-6.75,3.52s2.74,2.67,4.29,2.81l9.85,1.05c3.52,.35,11.53,1.2,11.53,8.86,0,7.03-6.82,11.11-17.65,11.11s-18.29-4.01-20.54-10.13Z"/>
            <path fill="#F9F9F9" d="M190.05,84.66v18.64h-9.42l.77-10.06-.49-.07c-1.83,6.61-8.09,10.83-16.6,10.83-7.17,0-11.46-2.88-11.46-8.3,0-4.57,3.09-7.03,10.13-8.3,5.13-.98,13.15-1.62,17.65-4.08-.21-4.36-3.52-6.75-9.14-6.75-7.03,0-11.11,3.87-9.21,8.79l-8.51,1.69c-3.59-9.49,4.64-16.81,17.58-16.81,11.25,0,18.71,5.49,18.71,14.42Zm-9.42,3.02v-1.27c-2.18,2.18-6.68,3.38-12.31,4.22-4.43,.63-6.05,1.62-6.05,3.73s1.76,3.31,5.34,3.31c7.1,0,13.01-4.43,13.01-9.99Z"/>
            <path fill="#F9F9F9" d="M257.43,84.17v19.13h-9.71v-18.36c0-4.85-2.53-7.74-6.68-7.74-4.92,0-7.88,3.59-7.88,9.78v16.32h-9.63v-18.36c0-4.85-2.53-7.74-6.75-7.74-4.92,0-7.81,3.59-7.81,9.78v16.32h-9.49v-32.35h9.49l-.7,9.63,.49,.07c1.34-6.54,5.77-10.41,12.17-10.41s10.83,3.66,11.32,11.18l.56,.07c1.12-7.03,5.7-11.25,12.31-11.25,7.67,0,12.31,5.27,12.31,13.93Z"/>
            <path fill="#F9F9F9" d="M263.76,93.88l6.12-3.94c1.62,4.64,7.1,7.53,14.7,7.53,4.99,0,8.02-1.48,8.02-4.15,0-2.46-2.6-2.74-4.5-2.95l-10.13-1.12c-2.88-.35-10.97-1.2-10.97-8.58,0-6.47,6.19-10.41,16.6-10.41,6.75,0,13.01,1.69,16.17,4.57l-3.73,5.84c-3.66-2.6-8.16-4.01-13.01-4.01-4.29,0-6.75,1.27-6.75,3.52s2.74,2.67,4.29,2.81l9.85,1.05c3.52,.35,11.53,1.2,11.53,8.86,0,7.03-6.82,11.11-17.65,11.11s-18.29-4.01-20.54-10.13Z"/>
            <path fill="#F9F9F9" d="M345.21,84.66v18.64h-9.42l.77-10.06-.49-.07c-1.83,6.61-8.09,10.83-16.6,10.83-7.17,0-11.46-2.88-11.46-8.3,0-4.57,3.09-7.03,10.13-8.3,5.13-.98,13.15-1.62,17.65-4.08-.21-4.36-3.52-6.75-9.14-6.75-7.03,0-11.11,3.87-9.21,8.79l-8.51,1.69c-3.59-9.49,4.64-16.81,17.58-16.81,11.25,0,18.71,5.49,18.71,14.42Zm-9.42,3.02v-1.27c-2.18,2.18-6.68,3.38-12.31,4.22-4.43,.63-6.05,1.62-6.05,3.73s1.76,3.31,5.34,3.31c7.1,0,13.01-4.43,13.01-9.99Z"/>
            <path fill="#F9F9F9" d="M380.8,91.63l-8.79-1.55c4.43-8.23,3.94-12.87-.7-12.87-4.29,0-7.17,4.08-7.17,10.34v15.75h-9.49v-32.35h9.49l-.7,9.63,.56,.07c1.55-6.47,5.98-10.41,12.17-10.41,9.14,0,11.18,8.65,4.64,21.38Z"/>
            <path fill="#F9F9F9" d="M428.06,84.66v18.64h-9.42l.77-10.06-.49-.07c-1.83,6.61-8.09,10.83-16.6,10.83-7.17,0-11.46-2.88-11.46-8.3,0-4.57,3.09-7.03,10.13-8.3,5.13-.98,13.15-1.62,17.65-4.08-.21-4.36-3.52-6.75-9.14-6.75-7.03,0-11.11,3.87-9.21,8.79l-8.51,1.69c-3.59-9.49,4.64-16.81,17.58-16.81,11.25,0,18.71,5.49,18.71,14.42Zm-9.42,3.02v-1.27c-2.18,2.18-6.68,3.38-12.31,4.22-4.43,.63-6.05,1.62-6.05,3.73s1.76,3.31,5.34,3.31c7.1,0,13.01-4.43,13.01-9.99Z"/>
        </g>
        <circle fill="#F6EF12" cx="53.28" cy="66.1" r="53.28"/>
        <text style={{ fill: '#231f20', fontFamily: 'sans-serif', fontSize: '112.82px', fontWeight: 500 }} transform="translate(29.51 92.53) rotate(6.55) scale(.97 1)"><tspan x="0" y="0">8</tspan></text>
    </g>
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

export const LockIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

export const FingerprintIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l1.214 1.942a2.25 2.25 0 001.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9a10.017 10.017 0 00-.972 2.392c-.387.87.577 1.72 1.357 1.219.463-.293.906-.67 1.326-1.124.638-.69 1.49-.526 1.928-.218.187.132.342.246.55.246.208 0 .363-.114.551-.246.248-.174.526-.257.808-.257.282 0 .56.083.807.257.188.132.344.246.551.246.208 0 .363-.114.55-.246.438-.308 1.29-.472 1.929.218.42.454.862.83 1.326 1.124.78.5 1.744-.35 1.357-1.22A10.017 10.017 0 0021.59 9M9.6 12.333l.6.6" />
    </svg>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);
