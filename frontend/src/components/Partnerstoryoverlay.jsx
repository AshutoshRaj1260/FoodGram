import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import "../styles/partner-story-overlay.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const PartnerStoryOverlay = ({ partnerId, partnerInitials = "?", onClose }) => {
  const [profile, setProfile]       = useState(null);
  const [stories, setStories]       = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress]     = useState(0);
  const [isPaused, setIsPaused]     = useState(false);
  const [loading, setLoading]       = useState(true);

  const mediaRef    = useRef(null);  
  const timerRef    = useRef(null);   
  const IMAGE_DURATION = 5000;        

 
  useEffect(() => {
    setLoading(true);

    const storiesReq = axios.get(`${API_URL}/api/stories/partner/${partnerId}`);
    const profileReq = axios.get(`${API_URL}/api/food-partner/${partnerId}`, {
      withCredentials: true,
    });

    Promise.all([storiesReq, profileReq])
      .then(([storiesRes, profileRes]) => {
        setStories(storiesRes.data.stories || []);
        setProfile(profileRes.data.foodPartner);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [partnerId]);


  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  goNext();
      if (e.key === "ArrowLeft")   goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, stories.length]);

 
  useEffect(() => {
    if (currentIndex < stories.length - 1) {
      const link = document.createElement("link");
      link.rel  = "prefetch";
      link.href = stories[currentIndex + 1].mediaUrl;
      document.head.appendChild(link);
    }
  }, [currentIndex, stories]);


  useEffect(() => {
    if (stories.length === 0) return;
    setProgress(0);
    clearTimeout(timerRef.current);

    const story = stories[currentIndex];

    if (story.mediaType === "video") {
      const vid = mediaRef.current;
      if (!vid) return;
      vid.currentTime = 0;
      if (!isPaused) vid.play().catch(() => {});
    } else {

      if (!isPaused) startImageTimer();
    }
  }, [currentIndex, stories]);

  const startImageTimer = () => {
    const start     = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct     = Math.min((elapsed / IMAGE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        timerRef.current = setTimeout(tick, 50);
      } else {
        goNext();
      }
    };
    timerRef.current = setTimeout(tick, 50);
  };


  const handleTimeUpdate = useCallback(() => {
    const vid = mediaRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  }, []);

  const handleVideoEnded = useCallback(() => goNext(), [currentIndex, stories.length]);


  const goNext = useCallback(() => {
    clearTimeout(timerRef.current);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    clearTimeout(timerRef.current);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const togglePause = () => {
    const story = stories[currentIndex];
    if (story?.mediaType === "video") {
      const vid = mediaRef.current;
      if (!vid) return;
      isPaused ? vid.play().catch(() => {}) : vid.pause();
    } else {
      clearTimeout(timerRef.current);
      if (isPaused) startImageTimer();
    }
    setIsPaused((p) => !p);
  };

  const currentStory = stories[currentIndex];

  return (
    <div className="pso-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pso-container" onClick={(e) => e.stopPropagation()}>

        {/* Progress bars */}
        <div className="pso-progress-row">
          {stories.map((_, i) => (
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

        {/* Header */}
        <div className="pso-header">
          <div className="pso-avatar">
            {loading ? "?" : (profile?.businessName?.[0]?.toUpperCase() ?? partnerInitials)}
          </div>
          <div className="pso-partner-name">
            {loading ? "Loading…" : profile?.businessName || "Partner"}
          </div>
          <button className="pso-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Media area */}
        <div className="pso-video-area" onClick={togglePause}>
          {loading ? (
            <div className="pso-loader"><div className="pso-spinner" /></div>
          ) : stories.length === 0 ? (
            <div className="pso-empty">No stories from this partner yet.</div>
          ) : currentStory?.mediaType === "video" ? (
            <>
              <video
                ref={mediaRef}
                key={currentStory._id}
                src={currentStory.mediaUrl}
                className="pso-video"
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
              {isPaused && <div className="pso-paused-badge">⏸</div>}
            </>
          ) : (
            <img
              key={currentStory._id}
              src={currentStory.mediaUrl}
              className="pso-video"   /* reuses same full-cover style */
              alt="Story"
              style={{ objectFit: "cover" }}
            />
          )}
        </div>

        {/* Tap zones */}
        {!loading && stories.length > 0 && (
          <>
            <button className="pso-tap-zone pso-tap-left"  onClick={goPrev} aria-label="Previous story" />
            <button className="pso-tap-zone pso-tap-right" onClick={goNext} aria-label="Next story" />
          </>
        )}

        {stories.length > 0 && (
          <div className="pso-counter">{currentIndex + 1} / {stories.length}</div>
        )}
      </div>
    </div>
  );
};

export default PartnerStoryOverlay;