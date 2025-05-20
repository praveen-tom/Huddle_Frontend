import React from "react";

const PlayPauseTTS = ({
  canPlay,
  canStop,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop
}) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '16px 0' }}>
    {!isPlaying && (
      <button
        onClick={onPlay}
        style={{ fontSize: 20, padding: '10px 28px', borderRadius: 50, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer' }}
        disabled={!canPlay}
      >
        ▶ Play
      </button>
    )}
    {isPlaying && !isPaused && (
      <button
        onClick={onPause}
        style={{ fontSize: 20, padding: '10px 28px', borderRadius: 50, background: '#fbc02d', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        ❚❚ Pause
      </button>
    )}
    {isPlaying && isPaused && (
      <button
        onClick={onResume}
        style={{ fontSize: 20, padding: '10px 28px', borderRadius: 50, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        ▶ Resume
      </button>
    )}
    <button
      onClick={onStop}
      style={{ fontSize: 20, padding: '10px 28px', borderRadius: 50, background: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' }}
      disabled={!canStop}
    >
      ■ Stop
    </button>
  </div>
);

export default PlayPauseTTS;
