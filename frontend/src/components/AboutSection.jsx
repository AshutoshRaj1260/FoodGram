import React, { useState, useRef, useEffect } from "react";
import "../styles/about-section.css";

const AboutSection = () => {
  // List of all available videos
  const videos = [
    "/8477403-hd_1080_1920_24fps.mp4",
    "/8908528-hd_1080_1920_25fps.mp4",
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mainVideoRef = useRef(null);

  // Preload next video
  useEffect(() => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    const nextVideoUrl = videos[nextIndex];
    
    // Create a hidden video element to preload the next video
    const preloadVideo = document.createElement('video');
    preloadVideo.src = nextVideoUrl;
    preloadVideo.preload = "auto";
    preloadVideo.muted = true;
  }, [currentVideoIndex, videos]);

  // Play next video when current one ends
  const handleVideoEnd = () => {
    setIsLoading(true);
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  // Handle video playing
  const handleVideoPlaying = () => {
    setIsLoading(false);
  };

  // Handle video waiting
  const handleVideoWaiting = () => {
    setIsLoading(true);
  };

  const videoUrl = videos[currentVideoIndex];

  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-visual">
          <div className="video-container">
            <video
              ref={mainVideoRef}
              className="reel-video"
              autoPlay
              muted
              playsInline
              preload="auto"
              src={videos[currentVideoIndex]}
              title="FoodGram Reel Preview"
              onEnded={handleVideoEnd}
              onPlaying={handleVideoPlaying}
              onWaiting={handleVideoWaiting}
              crossOrigin="anonymous"
              style={{ backgroundColor: "#000" }}
            />
            <div className="video-overlay"></div>
            {isLoading && <div className="video-loading"></div>}
          </div>
        </div>

        <div className="about-content">
          <h2 className="section-title">About FoodGram</h2>
          <p className="about-text">
            FoodGram is a revolutionary platform that brings food enthusiasts together. Whether you're a professional chef or a home cook, FoodGram is your creative space to showcase culinary talents and discover amazing recipes from around the world.
          </p>

          <div className="about-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🎬</span>
              <div>
                <h4>Food Reels</h4>
                <p>Share short, engaging food videos</p>
              </div>
            </div>

            <div className="highlight-item">
              <span className="highlight-icon">👨‍🍳</span>
              <div>
                <h4>Partner Program</h4>
                <p>Become a food partner and reach more users</p>
              </div>
            </div>

            <div className="highlight-item">
              <span className="highlight-icon">🌍</span>
              <div>
                <h4>Global Community</h4>
                <p>Connect with food lovers worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
