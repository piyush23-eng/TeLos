export function LiveMeter({ active }: { active: boolean }) {
  return (
    <div className={`voice-wave-container ${active ? 'active' : ''}`} aria-label={active ? 'Microphone live' : 'Microphone paused'}>
      <div className="voice-wave-bars">
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
      </div>
      <span className="voice-wave-label">{active ? 'AUDIO LIVE' : 'MIC PAUSED'}</span>
    </div>
  );
}
