import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from 'react-icons/fa';

const TextToSpeech = ({ content }) => {
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechRef = useRef(null);
  const currentIndexRef = useRef(0);

  // Accept both string and array for content
  let textOnly = "";
  if (typeof content === 'string') {
    textOnly = content;
  } else if (Array.isArray(content) && content.length > 0 && content[0].PageNumber && content[0].Text !== undefined) {
    textOnly = content.map(page => page.Text).join(" ");
  } else if (Array.isArray(content)) {
    textOnly = content.filter((item) => item.type === "text").map((item) => item.value).join(" ");
  }

  // Play TTS
  const playTTS = () => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (!textOnly || textOnly.trim() === "") {
      alert("No text to read.");
      return;
    }
    // Only cancel if already speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    let currentIndex = 0;
    currentIndexRef.current = 0;
    const utterance = new window.SpeechSynthesisUtterance(textOnly);
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
      if (event.name === "word") {
        setHighlightedWordIndex(currentIndex);
        currentIndexRef.current = currentIndex;
        currentIndex++;
      }
    };
    utterance.onend = () => {
      setHighlightedWordIndex(null);
      setIsPlaying(false);
      setIsPaused(false);
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseTTS = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(true);
    }
  };

  const resumeTTS = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  // Stop TTS
  const stopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setHighlightedWordIndex(null);
  };

  // Stop TTS only when component unmounts
  useEffect(() => {
    return () => {
      stopTTS();
    };
    // eslint-disable-next-line
  }, []);

  // Render text with highlighting for both formats
  let renderContent = null;
  if (typeof content === 'string') {
    renderContent = <p>{content}</p>;
  } else if (Array.isArray(content) && content.length > 0 && content[0].PageNumber && content[0].Text !== undefined) {
    // New format: [{ PageNumber, Text }]
    let wordCounter = 0;
    renderContent = content.map((page) => (
      <div key={page.PageNumber}>
        <h4>Page {page.PageNumber}</h4>
        <p>
          {page.Text.split(/\s+/).map((word, wordIdx) => {
            const globalWordIndex = wordCounter;
            wordCounter++;
            return (
              <span
                key={wordIdx}
                style={{
                  backgroundColor: highlightedWordIndex === globalWordIndex ? "yellow" : "transparent",
                  marginRight: "5px",
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    ));
  } else if (Array.isArray(content)) {
    // Old format: [{ type, value }]
    renderContent = content.map((item, index) => {
      if (item.type === "text") {
        let prevTextCount = content.slice(0, index).filter(i => i.type === "text").reduce((acc, curr) => acc + curr.value.split(/\s+/).length, 0);
        return (
          <p key={index}>
            {item.value.split(/\s+/).map((word, wordIndex) => {
              const globalWordIndex = prevTextCount + wordIndex;
              return (
                <span
                  key={wordIndex}
                  style={{
                    backgroundColor: highlightedWordIndex === globalWordIndex ? "yellow" : "transparent",
                    marginRight: "5px",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </p>
        );
      } else if (item.type === "image") {
        return (
          <img
            key={index}
            src={item.value}
            alt="Extracted"
            style={{ width: "100px", height: "auto" }}
          />
        );
      }
      return null;
    });
  }

  return (
    <div style={{ padding: "20px", width: "70%", height: "100%", backgroundColor: "#f0f0f0", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", margin: "20px auto" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Article</h2>
      {renderContent}
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
    </div>
  );
};

export default TextToSpeech;