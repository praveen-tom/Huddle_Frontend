import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const TextToSpeech = ({
  content,
  autoPlay = false,
  autoPlayTrigger,
  pauseTrigger,
  resumeTrigger,
  stopTrigger,
  onStatusChange,
  containerStyle,
  showControls = true,
}) => {
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechRef = useRef(null);
  const currentIndexRef = useRef(0);
  const wordMetaRef = useRef([]);

  const normalizeText = (value) =>
    `${value ?? ""}`
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const preprocessContent = useMemo(() => {
    const segments = [];
    const wordMeta = [];
    let combined = "";
    let globalWordIndex = 0;

    const pushTextSegment = (key, label, rawText) => {
      const normalized = normalizeText(rawText);
      if (!normalized) {
        return;
      }

      const words = normalized.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        return;
      }

      const wordIndices = [];
      words.forEach((word) => {
        if (!word) {
          return;
        }
        if (combined.length > 0) {
          combined += " ";
        }
        const start = combined.length;
        combined += word;
        const end = combined.length;
        wordMeta.push({
          start,
          end,
          segmentKey: key,
          localIndex: wordIndices.length,
          globalIndex: globalWordIndex,
        });
        wordIndices.push(globalWordIndex);
        globalWordIndex += 1;
      });

      segments.push({
        type: "text",
        key,
        label,
        words,
        wordIndices,
      });
    };

    const pushImageSegment = (key, src) => {
      if (!src) {
        return;
      }
      segments.push({ type: "image", key, src });
    };

    if (typeof content === "string") {
      pushTextSegment("segment-0", null, content);
    } else if (Array.isArray(content) && content.length > 0 && content[0].PageNumber !== undefined) {
      content.forEach((page, index) => {
        const label = page.PageNumber ? `Page ${page.PageNumber}` : null;
        pushTextSegment(`page-${page.PageNumber ?? index}`, label, page.Text ?? page.text ?? "");
      });
    } else if (Array.isArray(content)) {
      content.forEach((item, index) => {
        if (!item) {
          return;
        }

        if (item.type === "text") {
          pushTextSegment(`text-${index}`, null, item.value ?? item.text ?? item.Text ?? "");
        } else if (item.type === "image") {
          pushImageSegment(`image-${index}`, item.value ?? item.src);
        } else if (item.PageNumber !== undefined) {
          const label = item.PageNumber ? `Page ${item.PageNumber}` : null;
          pushTextSegment(`page-${item.PageNumber ?? index}`, label, item.Text ?? item.text ?? "");
        } else if (typeof item === "string") {
          pushTextSegment(`text-${index}`, null, item);
        }
      });
    }

    return {
      segments,
      combinedText: combined,
      wordMeta,
    };
  }, [content]);

  const { segments, combinedText, wordMeta } = preprocessContent;

  useEffect(() => {
    wordMetaRef.current = wordMeta;
    currentIndexRef.current = 0;
    setHighlightedWordIndex(null);
  }, [wordMeta]);

  // Play TTS
  const playTTS = React.useCallback(() => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (!combinedText || combinedText.trim() === "") {
      alert("No text to read.");
      return;
    }
    // Only cancel if already speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    currentIndexRef.current = 0;
    setHighlightedWordIndex(null);
    const utterance = new window.SpeechSynthesisUtterance(combinedText);
    utterance.rate = 1;
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onerror = (e) => {
      setIsPlaying(false);
      setIsPaused(false);
      setHighlightedWordIndex(null);
      // Optionally log error
    };
    utterance.onboundary = (event) => {
      if (typeof event.charIndex !== "number") {
        return;
      }

      const entries = wordMetaRef.current;
      if (!entries.length) {
        return;
      }

      let nextIndex = currentIndexRef.current;
      if (event.charIndex < entries[nextIndex]?.start) {
        nextIndex = 0;
      }

      while (nextIndex < entries.length && event.charIndex >= entries[nextIndex].end) {
        nextIndex += 1;
      }

      if (nextIndex < entries.length) {
        currentIndexRef.current = nextIndex;
        setHighlightedWordIndex(nextIndex);
      } else {
        setHighlightedWordIndex(null);
      }
    };
    utterance.onend = () => {
      setHighlightedWordIndex(null);
      setIsPlaying(false);
      setIsPaused(false);
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [combinedText]);

  const pauseTTS = React.useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(true);
    }
  }, []);

  const resumeTTS = React.useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  // Stop TTS
  const stopTTS = React.useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setHighlightedWordIndex(null);
  }, []);

  // Stop TTS only when component unmounts
  useEffect(() => {
    return () => {
      stopTTS();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }
    if (!combinedText) {
      return;
    }
    if (autoPlayTrigger === undefined || autoPlayTrigger === null) {
      return;
    }
    playTTS();
  }, [autoPlay, autoPlayTrigger, combinedText, playTTS]);

  useEffect(() => {
    if (pauseTrigger === undefined || pauseTrigger === null) {
      return;
    }
    pauseTTS();
  }, [pauseTrigger, pauseTTS]);

  useEffect(() => {
    if (resumeTrigger === undefined || resumeTrigger === null) {
      return;
    }
    resumeTTS();
  }, [resumeTrigger, resumeTTS]);

  useEffect(() => {
    if (stopTrigger === undefined || stopTrigger === null) {
      return;
    }
    stopTTS();
  }, [stopTrigger, stopTTS]);

  useEffect(() => {
    if (typeof onStatusChange !== "function") {
      return;
    }
    const status = isPlaying ? (isPaused ? "paused" : "playing") : "stopped";
    onStatusChange(status);
  }, [isPlaying, isPaused, onStatusChange]);

  // Render text with highlighting for both formats
  let renderContent = null;

  if (!segments.length) {
    renderContent = <p>No preview available.</p>;
  } else {
    renderContent = segments.map((segment) => {
      if (segment.type === "image") {
        return (
          <img
            key={segment.key}
            src={segment.src}
            alt="Extracted"
            style={{ width: "100px", height: "auto", marginRight: 8, marginBottom: 8 }}
          />
        );
      }

      return (
        <div key={segment.key} style={{ marginBottom: 12 }}>
          {segment.label && <h4 style={{ marginBottom: 8 }}>{segment.label}</h4>}
          <p>
            {segment.words.map((word, index) => {
              const globalIndex = segment.wordIndices[index];
              const isActive = highlightedWordIndex === globalIndex;
              return (
                <span
                  key={`${segment.key}-word-${index}`}
                  style={{
                    backgroundColor: isActive ? "#fff176" : "transparent",
                    transition: "background-color 0.15s ease",
                    padding: isActive ? "0 2px" : undefined,
                    borderRadius: isActive ? 4 : undefined,
                  }}
                >
                  {word}
                  {" "}
                </span>
              );
            })}
          </p>
        </div>
      );
    });
  }

  const wrapperStyle = {
    padding: "20px",
    width: "70%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: "20px auto",
    ...(containerStyle || {}),
  };

  return (
    <div style={wrapperStyle}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Article</h2>
      {renderContent}
      {showControls && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 16 }}>
          {!isPlaying && (
            <button
              onClick={playTTS}
              style={{ fontSize: 20, padding: '12px 32px', borderRadius: 8, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FaPlay /> Play
            </button>
          )}
          {isPlaying && !isPaused && (
            <button
              onClick={pauseTTS}
              style={{ fontSize: 20, padding: '12px 32px', borderRadius: 8, background: '#fbc02d', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FaPause /> Pause
            </button>
          )}
          {isPlaying && isPaused && (
            <button
              onClick={resumeTTS}
              style={{ fontSize: 20, padding: '12px 32px', borderRadius: 8, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FaPlay /> Resume
            </button>
          )}
          {isPlaying && (
            <button
              onClick={stopTTS}
              style={{ fontSize: 20, padding: '12px 32px', borderRadius: 8, background: '#f44336', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;