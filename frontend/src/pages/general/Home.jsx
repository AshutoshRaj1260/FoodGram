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
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  const userType = localStorage.getItem("userType") || "user";
  const { id } = useParams();

  // Initial fetch of videos
  useEffect(() => {
    let isMounted = true;

    const fetchInitialVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/food`, {
          params: { limit: 10 },
          withCredentials: true,
        });

        if (isMounted) {
          const { success, data } = response.data;
          if (success && data) {
            setVideos(data.videos || []);
            setNextCursor(data.nextCursor);
            setHasMore(data.hasMore);
          } else {
            // Fallback for safety/backward compatibility
            setVideos(response.data?.foodItems || []);
            setNextCursor(null);
            setHasMore(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch initial food items:", err.response?.data || err.message);
          setError("Failed to load feed. Please try again later.");
          setVideos([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch subsequent pages of videos
  const fetchNextPage = async () => {
    if (isFetching || !hasMore || !nextCursor) return;

    setIsFetching(true);
    try {
      const response = await axios.get(`${API_URL}/api/food`, {
        params: { cursor: nextCursor, limit: 10 },
        withCredentials: true,
      });

      const { success, data } = response.data;
      if (success && data) {
        setVideos((prev) => {
          // Safeguard against duplicate key rendering errors by filtering existing IDs
          const existingIds = new Set(prev.map((v) => v._id));
          const newVideos = (data.videos || []).filter((v) => !existingIds.has(v._id));
          return [...prev, ...newVideos];
        });
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch next page of food items:", err.response?.data || err.message);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle URL ID scrolling
  useEffect(() => {
    if (!id || !Array.isArray(videos) || videos.length === 0) return;

    const index = videos.findIndex((v) => v._id === id);
    if (index !== -1 && containerRef.current) {
      const el = containerRef.current.querySelectorAll(".reel")[index];
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, videos]);

  // Intersection Observer for autoplaying visible videos
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

  // Intersection Observer for Infinite Scrolling
  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;

    if (!container || !sentinel || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: container,
        rootMargin: "100px", // Pre-fetch slightly before the user hits the scroll bottom for seamless UI
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isFetching, nextCursor]);

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

          {/* Conditional scroll sentinel element */}
          {hasMore && (
            <div
              ref={sentinelRef}
              style={{
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#2dd4bf", // Teal matches FoodGram branding
                fontSize: "0.95rem",
                fontWeight: "600",
                padding: "20px 0"
              }}
            >
              {isFetching ? "Loading more delicious reels..." : ""}
            </div>
          )}
        </div>
      </div>
      <BottomNavBar userType={userType} />
    </>
  );
};

export default Home;
