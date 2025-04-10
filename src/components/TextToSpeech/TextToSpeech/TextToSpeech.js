import React, { useState, useRef } from "react";

const TextToSpeech = ({ content }) => {
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const speechRef = useRef(null);

  console.log('Content:', content); // Debug statement
  const speakText = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    // Extract all text content and split into words
    const textOnly = content
      .filter((item) => item.type === "text")
      .map((item) => item.value)
      .join(" ");
    const words = textOnly.split(/\s+/);

    let currentIndex = 0;
    const utterance = new SpeechSynthesisUtterance(textOnly);
    utterance.rate = 1;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setHighlightedWordIndex(currentIndex);
        currentIndex++;
      }
    };

    utterance.onend = () => {
      setHighlightedWordIndex(null);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: "20px",width: "70%", height: "100%",backgroundColor: "#f0f0f0", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" ,margin: "20px auto" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Article</h2>
      {content.map((item, index) => {
        console.log('Content Item:', item); // Debug statement

        if (item.type === "text") {
          return (
            <p key={index}>
              {item.value.split(/\s+/).map((word, wordIndex) => {
                const globalWordIndex = content
                  .slice(0, index)
                  .filter((i) => i.type === "text")
                  .reduce((acc, curr) => acc + curr.value.split(/\s+/).length, 0) + wordIndex;

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
        return null; // Fallback for unsupported types
      })}
      <button onClick={speakText}>Play</button>
      <button onClick={() => window.speechSynthesis.cancel()}>Stop</button>
    </div>
  );
};

export default TextToSpeech;