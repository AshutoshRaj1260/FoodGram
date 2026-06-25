import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import "./partner-story-overlay.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const PartnerStoryOverlay = ({ partnerId, partnerInitials = "?", onClose }) => {
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const progressTimer = useRef(null);
  const STORY_DURATION = 10000; // ms per story if non-video fallback


  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/food-partner/${partnerId}`, { withCredentials: true })
      .then((res) => {
        setProfile(res.data.foodPartner);
        setVideos(res.data.foodPartner?.foodItems || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [partnerId]);


  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, videos.length]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || videos.length === 0) return;

    setProgress(0);
    vid.currentTime = 0;

    if (!isPaused) {
      vid.play().catch(() => {});
    }
  }, [currentIndex, videos]);

  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  }, []);

  const handleVideoEnded = useCallback(() => {
    goNext();
  }, [currentIndex, videos.length]);

  const goNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, videos.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const togglePause = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isPaused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
    setIsPaused((p) => !p);
  };

  const currentVideo = videos[currentIndex];

  return (
    <div className="pso-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pso-container" onClick={(e) => e.stopPropagation()}>

        <div className="pso-progress-row">
          {videos.map((_, i) => (
            <div key={i} className="pso-progress-track">
              <div
                className="pso-progress-fill"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="pso-header">
          <div className="pso-avatar">{partnerInitials}</div>
          <div className="pso-partner-name">
            {loading ? "Loading…" : profile?.businessName || "Partner"}
          </div>
          <button className="pso-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="pso-video-area" onClick={togglePause}>
          {loading ? (
            <div className="pso-loader">
              <div className="pso-spinner" />
            </div>
          ) : videos.length === 0 ? (
            <div className="pso-empty">No reels from this partner yet.</div>
          ) : (
            <>
              <video
                ref={videoRef}
                key={currentVideo?._id}
                src={currentVideo?.video}
                className="pso-video"
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />

              {isPaused && (
                <div className="pso-paused-badge">⏸</div>
              )}

              {currentVideo?.name && (
                <div className="pso-food-label">{currentVideo.name}</div>
              )}
            </>
          )}
        </div>

        {!loading && videos.length > 0 && (
          <>
            <button
              className="pso-tap-zone pso-tap-left"
              onClick={goPrev}
              aria-label="Previous story"
            />
            <button
              className="pso-tap-zone pso-tap-right"
              onClick={goNext}
              aria-label="Next story"
            />
          </>
        )}

        {videos.length > 0 && (
          <div className="pso-counter">
            {currentIndex + 1} / {videos.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerStoryOverlay;