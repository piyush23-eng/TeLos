import React from 'react';
import type { InterviewerVisualState } from './HumanInterviewerAvatar';

interface VoiceOrbVisualizerProps {
  state: InterviewerVisualState;
  subtitles?: string;
  interviewerName?: string;
  companyName?: string;
  roleTitle?: string;
}

export const VoiceOrbVisualizer: React.FC<VoiceOrbVisualizerProps> = ({
  state,
  subtitles,
  interviewerName = 'Alex Rivera',
  companyName = 'Target Company',
  roleTitle = 'Staff Software Engineer'
}) => {
  return (
    <div className={`voice-visualizer-container ${state}`}>
      {/* Background Ambient Aura Glow */}
      <div className="voice-ambient-glow" />

      {/* Center Dynamic Voice Orb & Rings */}
      <div className="voice-orb-wrapper">
        <div className="voice-pulse-ring ring-3" />
        <div className="voice-pulse-ring ring-2" />
        <div className="voice-pulse-ring ring-1" />

        {/* Breathing Core Gradient Orb */}
        <div className="voice-core-orb">
          <div className="orb-inner-shine" />
          {/* Subtle audio frequency bars inside orb */}
          <div className="orb-wave-bars">
            <span className="bar b1" />
            <span className="bar b2" />
            <span className="bar b3" />
            <span className="bar b4" />
            <span className="bar b5" />
          </div>
        </div>
      </div>

      {/* State Indicator Badge */}
      <div className="voice-state-badge">
        <div className={`state-pill ${state}`}>
          {state === 'speaking' && (
            <>
              <div className="voice-wave-anim">
                <span /><span /><span /><span />
              </div>
              <b>ALEX IS SPEAKING...</b>
            </>
          )}
          {state === 'thinking' && (
            <>
              <span className="thinking-pulse-dot" />
              <b>ALEX IS THINKING &amp; ANALYZING...</b>
            </>
          )}
          {state === 'taking-notes' && (
            <>
              <span className="thinking-pulse-dot" />
              <b>ALEX IS TAKING NOTES...</b>
            </>
          )}
          {state === 'reviewing-code' && (
            <>
              <span className="thinking-pulse-dot" />
              <b>ALEX IS REVIEWING YOUR CODE...</b>
            </>
          )}
          {state === 'listening' && (
            <>
              <span className="listening-pulse-dot" />
              <b>ALEX IS LISTENING TO YOU...</b>
            </>
          )}
        </div>
      </div>

      {/* Live Closed Caption Subtitles */}
      {subtitles && (
        <div className="voice-subtitle-hud">
          <div className="subtitle-header">
            <span>🎙️ Alex Rivera • Live Call Audio</span>
          </div>
          <p>{subtitles}</p>
        </div>
      )}

      {/* Bottom Name Tag */}
      <div className="voice-panel-nametag">
        <div className="verified-interviewer-indicator" />
        <span><b>Alex Rivera</b> • {roleTitle} ({companyName})</span>
      </div>
    </div>
  );
};
