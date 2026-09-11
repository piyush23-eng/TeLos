import React from 'react';
import alexPortrait from '../assets/alex-interviewer.jpg';
import { Volume2, Sparkles, FileText, ShieldCheck, Hand } from 'lucide-react';

export type InterviewerVisualState = 'speaking' | 'thinking' | 'listening' | 'taking-notes' | 'reviewing-code';

interface HumanInterviewerAvatarProps {
  state: InterviewerVisualState;
  subtitles?: string;
  interviewerName?: string;
  companyName?: string;
  roleTitle?: string;
  onInterrupt?: () => void;
}

export const HumanInterviewerAvatar: React.FC<HumanInterviewerAvatarProps> = ({
  state,
  subtitles,
  interviewerName = 'Alex Rivera',
  companyName = 'Target Company',
  roleTitle = 'Staff Software Engineer',
  onInterrupt
}) => {
  return (
    <div className={`human-avatar-container state-${state}`}>
      {/* Dynamic Background Aura Glow */}
      <div className="avatar-ambient-glow" />

      {/* Main Video Tile Feed */}
      <div className="avatar-feed-frame">
        <img
          src={alexPortrait}
          alt={interviewerName}
          className="avatar-portrait-img"
        />

        {/* Live Studio Camera Scanlines & Glare Overlay */}
        <div className="avatar-lens-overlay" />

        {/* Audio Waveform Ring Pulsing Effect when speaking */}
        {state === 'speaking' && (
          <div className="avatar-speech-ring-glow">
            <span className="speech-ring r1" />
            <span className="speech-ring r2" />
            <span className="speech-ring r3" />
          </div>
        )}

        {/* Live Meeting Badge in Top-Left */}
        <div className="avatar-top-meta-badge">
          <span className="avatar-live-indicator-dot" />
          <span className="avatar-feed-label">HD 1080P • LIVE SCREEN</span>
        </div>

        {/* Floating Barge-In Interruption Button when Alex is speaking */}
        {state === 'speaking' && onInterrupt && (
          <button
            type="button"
            className="avatar-bargein-btn"
            onClick={onInterrupt}
            title="Interrupt Alex to ask a question or clarify constraints"
          >
            <Hand size={14} className="bargein-hand-icon" />
            <span>Interrupt Alex ⏎</span>
          </button>
        )}

        {/* Interactive Dynamic State Pill in Top-Right */}
        <div className="avatar-behavior-state-hud">
          {state === 'speaking' && (
            <div className="avatar-state-pill speaking">
              <div className="voice-equalizer-bars">
                <span /><span /><span /><span /><span />
              </div>
              <b>ALEX IS SPEAKING...</b>
            </div>
          )}

          {state === 'listening' && (
            <div className="avatar-state-pill listening">
              <span className="state-pulse-dot green" />
              <b>ALEX IS LISTENING TO YOU...</b>
            </div>
          )}

          {state === 'thinking' && (
            <div className="avatar-state-pill thinking">
              <span className="state-pulse-dot yellow" />
              <b>ALEX IS ANALYZING TRADE-OFFS...</b>
            </div>
          )}

          {state === 'taking-notes' && (
            <div className="avatar-state-pill taking-notes">
              <FileText size={13} className="note-icon-anim" />
              <b>ALEX IS TAKING ARCHITECTURE NOTES...</b>
            </div>
          )}

          {state === 'reviewing-code' && (
            <div className="avatar-state-pill reviewing-code">
              <Sparkles size={13} color="#a855f7" />
              <b>ALEX IS INSPECTING YOUR CODE...</b>
            </div>
          )}
        </div>

        {/* Realtime Live Closed-Captions Overlay */}
        {subtitles && (
          <div className="avatar-subtitle-tray">
            <div className="subtitle-speaker-tag">
              <Volume2 size={12} color="#22c55e" />
              <span>{interviewerName} • Verbal Dialogue</span>
            </div>
            <p className="subtitle-dialogue-text">{subtitles}</p>
          </div>
        )}

        {/* Bottom Verified Interviewer Bar */}
        <div className="avatar-bottom-id-bar">
          <div className="interviewer-identity-info">
            <div className="interviewer-verified-icon">
              <ShieldCheck size={14} color="#3b82f6" />
            </div>
            <div className="interviewer-text-details">
              <span className="interviewer-name">{interviewerName}</span>
              <span className="interviewer-credentials">{roleTitle} • {companyName}</span>
            </div>
          </div>
          <div className="interviewer-connection-pill">
            <span className="ping-dot" />
            <span>18ms • HD Voice</span>
          </div>
        </div>
      </div>
    </div>
  );
};
