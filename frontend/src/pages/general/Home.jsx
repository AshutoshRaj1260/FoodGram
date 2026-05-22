import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import BottomNavBar from "../../components/BottomNavBar";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ReelSkeleton from "../../components/ReelSkeleton";
import VideoPlayer from "../../components/VideoPlayer";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL || "";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const containerRef = useRef(null);

  const userType = localStorage.getItem("userType") || "user";
  const { id } = useParams();

  // Fetch videos
  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/food`, {
          withCredentials: true
        });

        if (isMounted) {
          // Safeguard: Ensure we set an array even if api returns undefined/null
          setVideos(response.data?.foodItems || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch food items:", err.response?.data || err.message);
          setError("Failed to load feed. Please try again later.");
          setVideos([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle URL ID scrolling
  useEffect(() => {
    if (!id || !Array.isArray(videos) || videos.length === 0) return;

    const index = videos.findIndex((v) => v._id === id);
    if (index !== -1 && containerRef.current) {
      const el = containerRef.current.querySelectorAll(".reel")[index];
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, videos]);

  // Intersection Observer for autoplay
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !Array.isArray(videos) || videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry && visibleEntry.intersectionRatio >= 0.6) {
          setActiveVideoId(visibleEntry.target.dataset.videoId);
        }

        entries.forEach((entry) => {
          const vid = entry.target.querySelector("video");
          if (!vid) return;

          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
            vid.pause();
          }
        });
      },
      {
        root: container,
        rootMargin: "0px",
        threshold: [0, 0.25, 0.6, 0.75, 1],
      },
    );

    const reels = container.querySelectorAll(".reel");
    reels.forEach((r) => observer.observe(r));

    return () => observer.disconnect();
  }, [videos]);

  const likeVideo = async (item) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === item._id
          ? {
              ...v,
              liked: !v.liked,
              likeCount: v.liked
                ? Math.max(0, v.likeCount - 1)
                : v.likeCount + 1,
            }
          : v
      )
    );

    try {
      await axios.post(
        `${API_URL}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
    }
  };
  const saveVideo = async (item) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === item._id
          ? {
              ...v,
              saved: !v.saved,
              saveCount: v.saved
                ? Math.max(0, v.saveCount - 1)
                : v.saveCount + 1,
            }
          : v
      )
    );

    try {
      await axios.post(
        `${API_URL}/api/food/save`,
        { foodId: item._id },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
    }
  };
  
  const renderFeed = () => {
    if (isLoading) return <ReelSkeleton count={3} />;

    if (error) {
      return (
        <div style={{ textAlign: "center", padding: "2rem", color: "#ff4d4f" }}>
          {error}
        </div>
      );
    }

    if (!Array.isArray(videos) || videos.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          No reels found. Check back later!
        </div>
      );
    }

    return videos.map((item) => (
      <article
        className="reel"
        key={item._id}
        role="listitem"
        data-video-id={item._id}
      >
        <VideoPlayer
          src={activeVideoId === item._id ? item.video : null}
        />

        <div className="overlay">
          <div 
            className="description" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item?.description || "") }} 
          />
          {item?.foodPartner && (
            <Link
              className="visit-btn"
              to={`/food-partner/${item.foodPartner}`}
            >
              Visit store
            </Link>
          )}
        </div>

        <div className="controls" aria-hidden="true">
          <div className="control-item">
            <button
              type="button"
              onClick={() => likeVideo(item)}
              className="control-btn"
              aria-label="Like"
            >
              {item.liked ? (<FavoriteIcon fontSize="large" style={{ color: "red" }}/>) : (<FavoriteBorderIcon fontSize="large"/>)}
            </button>
            <div className="count">{item?.likeCount || 0}</div>
          </div>

          <div className="control-item">
            <button
              type="button"
              onClick={() => saveVideo(item)}
              className="control-btn"
              aria-label="Save"
            >
              {item.saved ? (<BookmarkIcon fontSize="large" style={{ color: "white" }} />) : (<BookmarkBorderIcon fontSize="large" />)}
            </button>
            <div className="count">{item?.saveCount || 0}</div>
          </div>
        </div>

        <div className="hint">Scroll to view more</div>
      </article>
    ));
  };

  return (
    <>
      <div className="reel-section">
        <div className="reels" role="list" ref={containerRef}>
          {renderFeed()}
        </div>
      </div>
      <BottomNavBar userType={userType} />
    </>
  );
};

export default Home;
