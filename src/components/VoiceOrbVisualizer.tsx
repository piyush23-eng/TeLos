import React from 'react';

interface VoiceOrbVisualizerProps {
  state: 'speaking' | 'thinking' | 'listening';
  subtitles?: string;
  interviewerName?: string;
  companyName?: string;
}

export const VoiceOrbVisualizer: React.FC<VoiceOrbVisualizerProps> = ({
  state,
  subtitles,
  interviewerName = 'Alex',
  companyName = 'Target Company'
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
              <b>{interviewerName.toUpperCase()} IS SPEAKING...</b>
            </>
          )}
          {state === 'thinking' && (
            <>
              <span className="thinking-pulse-dot" />
              <b>{interviewerName.toUpperCase()} IS THINKING...</b>
            </>
          )}
          {state === 'listening' && (
            <>
              <span className="listening-pulse-dot" />
              <b>{interviewerName.toUpperCase()} IS LISTENING TO YOU...</b>
            </>
          )}
        </div>
      </div>

      {/* Live Closed Caption Subtitles */}
      {subtitles && (
        <div className="voice-subtitle-hud">
          <div className="subtitle-header">
            <span>🎙️ {interviewerName} • Question</span>
          </div>
          <p>{subtitles}</p>
        </div>
      )}

      {/* Bottom Name Tag */}
      <div className="voice-panel-nametag">
        <span><b>{interviewerName}</b> • AI Interviewer ({companyName})</span>
      </div>
    </div>
  );
};
