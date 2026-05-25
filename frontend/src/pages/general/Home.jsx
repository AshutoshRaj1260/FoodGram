import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import BottomNavBar from "../../components/BottomNavBar";
import LikeIcon from "@mui/icons-material/FavoriteBorder";
import BookmarksIcon from "@mui/icons-material/BookmarkBorder";
import ReelSkeleton from "../../components/ReelSkeleton";
import VideoPlayer from "../../components/VideoPlayer";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL || "";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [selectedMood, setSelectedMood] = useState("");

  const containerRef = useRef(null);

  const userType = localStorage.getItem("userType") || "user";
  const { id } = useParams();

  // Fetch Videos
  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_URL}/api/food`,
          {
            params: selectedMood
              ? { mood: selectedMood }
              : {},
            withCredentials: true,
          }
        );

        if (isMounted) {
          setVideos(response.data?.foodItems || []);
        }
      } catch (err) {
        console.error("Feed fetch error:", err);

        if (isMounted) {
          setError("Failed to load feed.");
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
  }, [selectedMood]);

  // Scroll to reel by URL id
  useEffect(() => {
    if (!id || !Array.isArray(videos) || videos.length === 0) return;

    const index = videos.findIndex((v) => v._id === id);

    if (index !== -1 && containerRef.current) {
      const el = containerRef.current.querySelectorAll(".reel")[index];
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, videos]);

  // Auto-play visible reel
  useEffect(() => {
    const container = containerRef.current;

    if (!container || !Array.isArray(videos) || videos.length === 0)
      return;

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
      }
    );

    const reels = container.querySelectorAll(".reel");

    reels.forEach((r) => observer.observe(r));

    return () => observer.disconnect();
  }, [videos]);

  // Like Reel
  const likeVideo = async (item) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                likeCount: response.data.likeCount,
              }
            : v
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Save Reel
  const saveVideo = async (item) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/food/save`,
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                saveCount: response.data.saveCount,
              }
            : v
        )
      );
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const renderFeed = () => {
    if (isLoading) {
      return <ReelSkeleton count={3} />;
    }

    if (error) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#ff4d4f",
          }}
        >
          {error}
        </div>
      );
    }

    if (!Array.isArray(videos) || videos.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
          }}
        >
          No reels found for this mood.
        </div>
      );
    }

    return (
      <>
        {/* Mood Filter */}
        <div className="mood-filter">
          <button
            className={!selectedMood ? "active" : ""}
            onClick={() => setSelectedMood("")}
          >
            All
          </button>

          <button
            className={selectedMood === "Spicy" ? "active" : ""}
            onClick={() => setSelectedMood("Spicy")}
          >
            Spicy
          </button>

          <button
            className={selectedMood === "Sweet" ? "active" : ""}
            onClick={() => setSelectedMood("Sweet")}
          >
            Sweet
          </button>

          <button
            className={selectedMood === "Healthy" ? "active" : ""}
            onClick={() => setSelectedMood("Healthy")}
          >
            Healthy
          </button>

          <button
            className={selectedMood === "Street Food" ? "active" : ""}
            onClick={() => setSelectedMood("Street Food")}
          >
            Street Food
          </button>
        </div>

        {/* Reels */}
        {videos.map((item) => (
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
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    item?.description || ""
                  ),
                }}
              />

              {item?.foodPartner && (
                <Link
                  className="visit-btn"
                  to={`/food-partner/${item.foodPartner}`}
                >
                  Visit Store
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
                  <LikeIcon fontSize="large" />
                </button>

                <div className="count">
                  {item?.likeCount || 0}
                </div>
              </div>

              <div className="control-item">
                <button
                  type="button"
                  onClick={() => saveVideo(item)}
                  className="control-btn"
                  aria-label="Save"
                >
                  <BookmarksIcon fontSize="large" />
                </button>

                <div className="count">
                  {item?.saveCount || 0}
                </div>
              </div>
            </div>

            <div className="hint">
              Scroll to view more
            </div>
          </article>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="reel-section">
        <div
          className="reels"
          role="list"
          ref={containerRef}
        >
          {renderFeed()}
        </div>
      </div>

      <BottomNavBar userType={userType} />
    </>
  );
};

export default Home;