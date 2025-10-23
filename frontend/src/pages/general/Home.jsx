import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const containerRef = useRef(null);
  const videoRefs = useRef(new Map());

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: [0.5, 0.75, 1.0],
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const vid = entry.target.querySelector("video");
        if (!vid) return;

        // if the video is mostly visible (>= 75%), play it, otherwise pause
        if (entry.intersectionRatio >= 0.75) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, options);

    const reels = containerRef.current?.querySelectorAll(".reel") || [];
    reels.forEach((r) => observer.observe(r));

    // Pause all videos initially, then play the first visible one
    reels.forEach((r) => {
      const v = r.querySelector("video");
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    });

    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/food", {
        withCredentials: true,
      })
      .then((response) => {
        setVideos(response.data.foodItems);
      });
  },[]);

  return (
    <div className="reels" role="list" ref={containerRef}>
      {videos.map((item) => (
        <article
          className="reel"
          key={item._id}
          role="listitem"
          ref={(el) => {
            if (el) videoRefs.current.set(item._id, el);
          }}
        >
          <video src={item.video} muted loop playsInline preload="metadata" />

          <div className="overlay">
            <div className="description">{item.description}</div>
            <Link
              className="visit-btn"
              to={"/food-partner/" + item.foodPartner}
            >
              Visit store
            </Link>
          </div>
          
          <div className="hint">Scroll to view more</div>
        </article>
      ))}
    </div>
  );
};

export default Home;
