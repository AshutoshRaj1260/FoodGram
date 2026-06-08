import React, { useRef, useState, useEffect, useCallback } from "react";
import "../styles/cooking-mode.css";

const CookingModeOverlay = ({ videoSrc, onExit }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const wakeLockRef = useRef(null);

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

      {/* Play / Pause */}
      <button
        id="cm-playpause-btn"
        className="cm-playpause-btn"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <p className="cm-label" aria-hidden="true">
        Cooking Mode: Distraction-Free
      </p>
    </div>
  );
};

export default CookingModeOverlay;
