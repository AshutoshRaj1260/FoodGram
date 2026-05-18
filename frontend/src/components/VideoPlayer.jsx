import React, { useRef, useEffect, useState } from "react";
import useNetworkStatus from "../hooks/useNetworkStatus";
import {
  VIDEO_QUALITIES,
  DEFAULT_VIDEO_QUALITY,
  NETWORK_SWITCH_DEBOUNCE,
} from "../utils/constants";
const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const debounceTimeout = useRef(null);

  const networkSpeed = useNetworkStatus();

  const [videoSrc, setVideoSrc] = useState(src);

  // Select video quality based on network speed
  useEffect(() => {
    if (!src) return;

    // Future-ready quality mapping
    // Replace with real CDN/video URLs later
    const qualityMap = {
  [VIDEO_QUALITIES.SLOW]: src,   // TODO: replace with 480p URL
  [VIDEO_QUALITIES.MEDIUM]: src, // TODO: replace with 720p URL
  [VIDEO_QUALITIES.FAST]: src,   // TODO: replace with 1080p URL
};

    const selectedSrc =
  qualityMap[networkSpeed] ||
  qualityMap[DEFAULT_VIDEO_QUALITY] ||
  src;

    // Avoid unnecessary reloads
    if (selectedSrc === videoSrc) return;

    // Preload next source before switching
    const tempVideo = document.createElement("video");

    tempVideo.src = selectedSrc;
    tempVideo.preload = "metadata";

    const handleCanPlay = () => {
      clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(() => {
        setVideoSrc(selectedSrc);
      }, NETWORK_SWITCH_DEBOUNCE);
    };

    tempVideo.addEventListener("canplay", handleCanPlay);

    tempVideo.load();

    return () => {
      tempVideo.removeEventListener("canplay", handleCanPlay);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [networkSpeed, src, videoSrc]);

  // Reload safely when source changes
  useEffect(() => {
    const vid = videoRef.current;

    if (!vid) return;

    vid.load();

    const playPromise = vid.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [videoSrc]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
};

export default VideoPlayer;