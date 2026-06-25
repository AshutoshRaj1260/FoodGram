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
import PartnerStoryOverlay from "../../components/PartnerStoryOverlay";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL || "";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [cookingVideo, setCookingVideo] = useState(null);

  // Story overlay state — stores { partnerId, initials } or null
  const [storyPartner, setStoryPartner] = useState(null);

  const containerRef = useRef(null);

  const userType = localStorage.getItem("userType") || "user";
  const { id } = useParams();

  // ── Fetch videos ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/food`, {
          withCredentials: true,
        });
        if (isMounted) {
          setVideos(response.data?.foodItems || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch food items:", err.response?.data || err.message);
          setError("Failed to load feed. Please try again later.");
          setVideos([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVideos();
    return () => { isMounted = false; };
  }, []);

  // ── Scroll to reel by URL id ──────────────────────────────────────────────
  useEffect(() => {
    if (!id || !Array.isArray(videos) || videos.length === 0) return;
    const index = videos.findIndex((v) => v._id === id);
    if (index !== -1 && containerRef.current) {
      const el = containerRef.current.querySelectorAll(".reel")[index];
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, videos]);

  // ── Intersection Observer for autoplay ────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !Array.isArray(videos) || videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((e) => e.isIntersecting)
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


  const likeVideo = async (item) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true }
      );
      setVideos((prev) =>
        Array.isArray(prev)
          ? prev.map((v) =>
              v._id === item._id ? { ...v, likeCount: response.data.likeCount } : v
            )
          : []
      );
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
      setVideos((prev) =>
        Array.isArray(prev)
          ? prev.map((v) =>
              v._id === item._id ? { ...v, saveCount: response.data.saveCount } : v
            )
          : []
      );
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        console.warn("Save: user not logged in");
      } else {
        console.error("Save error:", err.response?.data || err.message);
      }
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

    return videos.map((item) => {
      const partnerId =
        typeof item.foodPartner === "object"
          ? item.foodPartner?._id
          : item.foodPartner;

      // Derive initials — item.foodPartner may be a populated object or bare id
      const partnerName =
        typeof item.foodPartner === "object"
          ? item.foodPartner?.businessName ?? ""
          : "";
      const initials = getInitials(partnerName) || "FP";

      return (
        <article
          className="reel"
          key={item._id}
          role="listitem"
          data-video-id={item._id}
        >
          <VideoPlayer src={activeVideoId === item._id ? item.video : null} />

          <div className="overlay">
            <div
              className="description"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(item?.description || ""),
              }}
            />

            {/* ── Visit store row with profile avatar ── */}
            {partnerId && (
              <div className="visit-row">
                {/* Profile avatar → opens story overlay */}
                <button
                  type="button"
                  className="partner-avatar-btn"
                  aria-label={`View ${partnerName || "partner"} stories`}
                  onClick={() =>
                    setStoryPartner({ partnerId, initials })
                  }
                >
                  {initials}
                </button>

                {/* Visit store button → navigates to profile page */}
                <Link
                  className="visit-btn"
                  to={`/food-partner/${partnerId}`}
                >
                  Visit store
                </Link>
              </div>
            )}
          </div>

          {/* ── Side controls ── */}
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
      );
    });
  };

  return (
    <>
      <div className="reel-section">
        <div className="reels" role="list" ref={containerRef}>
          {renderFeed()}
        </div>
      </div>

      <BottomNavBar userType={userType} />

      {cookingVideo && (
        <CookingModeOverlay
          videoSrc={cookingVideo}
          onExit={() => setCookingVideo(null)}
        />
      )}


      {storyPartner && (
        <PartnerStoryOverlay
          partnerId={storyPartner.partnerId}
          partnerInitials={storyPartner.initials}
          onClose={() => setStoryPartner(null)}
        />
      )}
    </>
  );
};

export default Home;