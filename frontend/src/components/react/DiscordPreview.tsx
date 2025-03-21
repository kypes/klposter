import React from 'react';

interface DiscordPreviewProps {
  title: string;
  description: string;
  trackList: string;
  externalUrl: string;
}

export function DiscordPreview({ title, description, trackList, externalUrl }: DiscordPreviewProps) {
  // Format track list by splitting on newlines and cleaning up
  const formattedTrackList = trackList
    .split('\n')
    .filter(track => track.trim())
    .join('\n');

  // Get hostname from URL if valid
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-[#36393f] p-4 max-w-2xl font-[Whitney,'Helvetica Neue',Helvetica,Arial,sans-serif]">
      {/* Author section */}
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-discord flex items-center justify-center text-white text-xs">KL</div>
        <div className="ml-2">
          <div className="text-white font-medium">Kingdom Leaks</div>
          <div className="text-xs text-gray-400">Music Release</div>
        </div>
      </div>

      {/* Embed content */}
      <div className="border-l-4 border-discord pl-3">
        {/* Title */}
        <div className="mb-2">
          <div className="text-base font-semibold text-white hover:underline cursor-pointer">
            {title || 'Untitled Release'}
          </div>
        </div>

        {/* Description */}
        <div className="mb-2 text-sm text-gray-300 whitespace-pre-wrap">
          {description || 'No description provided'}
        </div>

        {/* Track List */}
        <div className="mb-2 text-sm text-gray-300">
          <div className="font-semibold mb-1">Track List:</div>
          <div className="font-mono text-xs whitespace-pre-wrap bg-[#2f3136] p-2 rounded">
            {formattedTrackList || 'No tracks added yet'}
          </div>
        </div>

        {/* External URL */}
        {externalUrl && (
          <div className="mt-2 text-xs">
            <a 
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00b0f4] hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.293 7.293-1.414-1.414L17.586 5H13V3h8z" />
              </svg>
              {getHostname(externalUrl)}
            </a>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="mt-2 text-xs text-gray-400">
        {new Date().toLocaleString()}
      </div>
    </div>
  );
} 