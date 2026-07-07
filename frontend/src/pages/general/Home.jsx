import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import "../../styles/cooking-mode.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import BottomNavBar from "../../components/BottomNavBar";
import LikeIcon from "@mui/icons-material/FavoriteBorder";
import BookmarksIcon from "@mui/icons-material/BookmarkBorder";
import ReelSkeleton from "../../components/ReelSkeleton";
import VideoPlayer from "../../components/VideoPlayer";
import CookingModeOverlay from "../../components/CookingModeOverlay";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL || "";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [cookingVideo, setCookingVideo] = useState(null); // URL of video in cooking mode
  const containerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const userType = localStorage.getItem("userType") || "user";
  const { id } = useParams();

  // Fetch videos
  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/food?page=${page}&limit=10`, {
          withCredentials: true
        });

        if (isMounted) {
          const newVideos = response.data?.foodItems || [];
          if (page === 1) {
            setVideos(newVideos);
          } else {
            setVideos(prev => {
              // Prevent duplicates if API returns overlapping data
              const existingIds = new Set(prev.map(v => v._id));
              const filteredNew = newVideos.filter(v => !existingIds.has(v._id));
              return [...prev, ...filteredNew];
            });
          }
          setHasMore(response.data?.pagination?.hasMore ?? false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch food items:", err.response?.data || err.message);
          setError("Failed to load feed. Please try again later.");
          if (page === 1) setVideos([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, [page]);

  // Load More Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasMore, isFetchingMore, isLoading]);

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
    try {
      const response = await axios.post(
        `${API_URL}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((v) =>
          v._id === item._id ? { ...v, likeCount: response.data.likeCount } : v,
        );
      });
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
    }
  };

  const saveVideo = async (item) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/food/save`,
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((v) =>
          v._id === item._id ? { ...v, saveCount: response.data.saveCount } : v,
        );
      });
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

    return (
      <>
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

            <div className="controls">
              <div className="control-item">
                <button
                  type="button"
                  onClick={() => likeVideo(item)}
                  className="control-btn"
                  aria-label="Like"
                >
                  <LikeIcon fontSize="large" />
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
                  <BookmarksIcon fontSize="large" />
                </button>
                <div className="count">{item?.saveCount || 0}</div>
              </div>

              {/* Cook button — launches distraction-free cooking mode */}
              <div className="control-item">
                <button
                  id={`cook-btn-${item._id}`}
                  type="button"
                  className="cook-btn"
                  onClick={() => setCookingVideo(item.video)}
                  aria-label="Enter Cooking Mode"
                >
                  <span className="cook-btn__icon">🍴</span>
                </button>
                <span className="cook-btn__label">Cook</span>
              </div>
            </div>

            <div className="hint">Scroll to view more</div>
          </article>
        ))}
        {isFetchingMore && (
           <div style={{ padding: "1rem", display: "flex", justifyContent: "center" }}>
             <ReelSkeleton count={1} />
           </div>
        )}
        {!isFetchingMore && hasMore && (
           <div ref={loadMoreRef} style={{ height: "20px", margin: "10px 0" }}></div>
        )}
        {!hasMore && videos.length > 0 && (
           <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
             You've reached the end!
           </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="reel-section">
        <div className="reels" role="list" ref={containerRef}>
          {renderFeed()}
        </div>
      </div>
      <BottomNavBar userType={userType} />

      {/* Cooking Mode — mounts as a portal-like fixed overlay */}
      {cookingVideo && (
        <CookingModeOverlay
          videoSrc={cookingVideo}
          onExit={() => setCookingVideo(null)}
        />
      )}
    </>
  );
};

export default Home;
