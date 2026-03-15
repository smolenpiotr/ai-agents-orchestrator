import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Robot head */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* Antenna */}
          <line x1="12" y1="2" x2="12" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="1.5" r="1.5" fill="white"/>
          {/* Head */}
          <rect x="4" y="5" width="16" height="12" rx="3" fill="white" fillOpacity="0.95"/>
          {/* Eyes */}
          <circle cx="9" cy="11" r="2" fill="#6366f1"/>
          <circle cx="15" cy="11" r="2" fill="#6366f1"/>
          <circle cx="9.7" cy="10.3" r="0.6" fill="white"/>
          <circle cx="15.7" cy="10.3" r="0.6" fill="white"/>
          {/* Mouth */}
          <rect x="9" y="14" width="6" height="1.5" rx="0.75" fill="#6366f1" fillOpacity="0.6"/>
          {/* Body/neck */}
          <rect x="10" y="17" width="4" height="3" rx="1" fill="white" fillOpacity="0.7"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
