import React, { useState, useRef, useEffect } from "react";

const TextToSpeech = ({ content }) => {
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const speechRef = useRef(null);
  const currentIndexRef = useRef(0);

  // Support both old and new content formats
  let textOnly = "";
  if (Array.isArray(content) && content.length > 0 && content[0].PageNumber && content[0].Text !== undefined) {
    // New format: [{ PageNumber, Text }]
    textOnly = content.map(page => page.Text).join(" ");
  } else {
    // Old format: [{ type, value }]
    textOnly = content.filter((item) => item.type === "text").map((item) => item.value).join(" ");
  }

  // Play TTS
  const playTTS = () => {
    console.log('[TTS] Play button clicked. textOnly:', textOnly);
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (!textOnly || textOnly.trim() === "") {
      alert("No text to read.");
      return;
    }
    window.speechSynthesis.cancel(); // Always cancel any previous utterance
    let currentIndex = 0;
    currentIndexRef.current = 0;
    const utterance = new window.SpeechSynthesisUtterance(textOnly);
    utterance.rate = 1;
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsStarted(true);
      console.log('[TTS] Speech started');
    };
    utterance.onerror = (e) => {
      setIsPlaying(false);
      setIsStarted(false);
      setHighlightedWordIndex(null);
      console.error("[TTS] Speech error:", e);
    };
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setHighlightedWordIndex(currentIndex);
        currentIndexRef.current = currentIndex;
        currentIndex++;
        console.log('[TTS] Speaking word index:', currentIndex - 1, event);
      }
    };
    utterance.onend = () => {
      setHighlightedWordIndex(null);
      setIsPlaying(false);
      setIsStarted(false);
      console.log('[TTS] Speech ended');
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    console.log('[TTS] Speech synthesis started with text:', textOnly);
  };

  // Stop TTS
  const stopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsStarted(false);
    setHighlightedWordIndex(null);
    console.log('[TTS] Stop button clicked. Speech synthesis cancelled.');
  };

  // If content changes, stop any ongoing TTS
  useEffect(() => {
    stopTTS();
    setIsStarted(false);
    setIsPlaying(false);
    setHighlightedWordIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Render text with highlighting for both formats
  let renderContent = null;
  if (Array.isArray(content) && content.length > 0 && content[0].PageNumber && content[0].Text !== undefined) {
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
  } else {
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
        <button
          onClick={isPlaying ? stopTTS : playTTS}
          style={{ fontSize: 20, padding: '12px 32px', borderRadius: 8, background: isPlaying ? '#f44336' : '#4caf50', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default TextToSpeech;