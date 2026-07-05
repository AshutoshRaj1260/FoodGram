import React, { useRef, useState, useEffect, useCallback } from "react";
import "../styles/cooking-mode.css";

// Check if Speech Recognition is supported in the current browser
const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
const isSpeechSupported = !!SpeechRecognition;

const CookingModeOverlay = ({ videoSrc, onExit }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const wakeLockRef = useRef(null);
  const recognitionRef = useRef(null);

  // Request wake lock
  useEffect(() => {
    const requestWakeLock = async () => {
      if (!("wakeLock" in navigator)) {
        console.warn("Wake Lock API not supported on this device");
        return;
      }
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.warn("Wake lock request failed:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => { });
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Sync play/pause button with actual video state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // Autoplay the video when overlay opens
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => { });
      });
    }
  }, [videoSrc]);

  const handleExit = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onExit();
  }, [onExit]);

  // Lock scroll and add Escape key support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleExit();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [handleExit]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  };

  // Setting up the voice command companion.
  // It handles microphone activation, speech parsing, and restarts.
  useEffect(() => {
    // If the user turns it off, we stop listening and clean up.
    if (!isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    if (!isSpeechSupported) {
      console.warn("Hey, your browser does not support Speech Recognition.");
      setIsListening(false);
      return;
    }

    // Creating the recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech engine active...");
    };

    recognition.onresult = (event) => {
      const currentResultIndex = event.resultIndex;
      const transcript = event.results[currentResultIndex][0].transcript.trim().toLowerCase();
      
      const video = videoRef.current;
      if (!video) return;

      // Speech recognition can be tricky with homophones or accent variations.
      // 'pause' often gets transcribed as 'paws', 'pose', or 'pass'. We check for these to be safe.
      const isPlayCommand = transcript.includes("play") || transcript.includes("start");
      const isPauseCommand = transcript.includes("pause") || transcript.includes("paws") || transcript.includes("pose") || transcript.includes("stop");

      if (isPlayCommand) {
        video.play().catch(() => {});
      } else if (isPauseCommand) {
        video.pause();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech service error:", event.error);
    };

    recognition.onend = () => {
      // Chrome stops listening if the user stays quiet for too long.
      // Since their hands are covered in cookie dough, let's restart it automatically.
      if (isListening && recognitionRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.warn("Failed to restart speech recognition:", err);
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }

    // Stop listening when the component is unmounted or isListening is toggled off
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isListening]);

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true" aria-label="Cooking Mode">
      {/* Exit button */}
      <button
        id="cm-exit-btn"
        className="cm-exit-btn"
        onClick={handleExit}
        aria-label="Exit Cooking Mode"
      >
        Exit Cooking Mode
      </button>

      <div className="cm-video-wrapper">
        <video
          ref={videoRef}
          src={videoSrc}
          className="cm-video"
          loop
          playsInline
          preload="auto"
          onClick={togglePlayPause}
          aria-label="Recipe video"
        />

        <div
          className={`cm-play-indicator ${isPlaying ? "cm-play-indicator--hidden" : ""}`}
          aria-hidden="true"
        >
          <span className="cm-play-icon">▶</span>
        </div>
      </div>

      <div className="cm-controls-container">
        {/* Play / Stop */}
        <button
          id="cm-playpause-btn"
          className="cm-playpause-btn"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? "⏸ Stop" : "▶ Play"}
        </button>

        {/* Voice control button */}
        <button
          id="cm-voice-btn"
          className={`cm-voice-btn ${isListening ? "cm-voice-btn--listening" : ""}`}
          onClick={() => setIsListening(!isListening)}
          aria-label={isListening ? "Stop voice control" : "Start voice control"}
          title={isSpeechSupported ? "Voice Control" : "Voice control not supported in your browser"}
          disabled={!isSpeechSupported}
        >
          {isListening ? "Listening..." : "🎤 Voice Control"}
        </button>
      </div>

      <p className="cm-label" aria-hidden="true">
        {isListening ? "Voice active: say 'play' or 'stop'" : "Cooking Mode: Distraction-Free"}
      </p>
    </div>
  );
};

export default CookingModeOverlay;
