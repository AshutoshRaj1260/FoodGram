import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import BottomNavBar from "../../components/BottomNavBar";
import LikeIcon from "@mui/icons-material/FavoriteBorder";
import BookmarksIcon from "@mui/icons-material/BookmarkBorder";
import ReelSkeleton from "../../components/ReelSkeleton";

const API_URL = import.meta.env.VITE_API_URL || "";

const getImageKitThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return "";

  const [urlWithoutHash, hash = ""] = videoUrl.split("#");
  const [baseUrl, query = ""] = urlWithoutHash.split("?");
  const thumbnailUrl = `${baseUrl}/ik-thumbnail.jpg`;

  if (query && hash) return `${thumbnailUrl}?${query}#${hash}`;
  if (query) return `${thumbnailUrl}?${query}`;
  if (hash) return `${thumbnailUrl}#${hash}`;

  return thumbnailUrl;
};

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  const containerRef = useRef(null);

  const userType = localStorage.getItem("userType") || "user";
  const { id } = useParams();

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
        console.error(err);

        if (isMounted) {
          setError("Failed to load reels.");
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

  useEffect(() => {
    if (!id || videos.length === 0) return;

    const index = videos.findIndex((v) => v._id === id);

    if (index !== -1 && containerRef.current) {
      const el = containerRef.current.querySelectorAll(".reel")[index];
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, videos]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || videos.length === 0) return;

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
        threshold: [0, 0.25, 0.6, 1],
      }
    );

    const reels = container.querySelectorAll(".reel");

    reels.forEach((r) => observer.observe(r));

    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !activeVideoId) return;

    const videosInFeed = container.querySelectorAll("video");

    videosInFeed.forEach((video) => {
      const reel = video.closest(".reel");

      if (reel?.dataset.videoId === activeVideoId) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeVideoId]);

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
            ? { ...v, likeCount: response.data.likeCount }
            : v
        )
      );
    } catch (err) {
      console.error(err);
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
        prev.map((v) =>
          v._id === item._id
            ? { ...v, saveCount: response.data.saveCount }
            : v
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const renderFeed = () => {
    if (isLoading) return <ReelSkeleton count={3} />;

    if (error) {
      return (
        <div className="empty-state">
          <h2>⚠ Unable to load feed</h2>
          <p>Please try again later.</p>
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <div className="empty-state">
          <h2>🍔 No Reels Yet</h2>
          <p>Fresh food content coming soon!</p>
        </div>
      );
    }

    return videos.map((item) => (
      <motion.article
        className="reel"
        key={item._id}
        role="listitem"
        data-video-id={item._id}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <video
          src={activeVideoId === item._id ? item.video : undefined}
          poster={getImageKitThumbnailUrl(item.video)}
          muted
          loop
          playsInline
          preload="none"
        />

        <div className="overlay">
          <div className="description">
            {item?.description || "Delicious food reel 🍕"}
          </div>

          {item?.foodPartner && (
            <Link
              className="visit-btn"
              to={`/food-partner/${item.foodPartner}`}
            >
              Visit Store
            </Link>
          )}
        </div>

        <div className="controls">
          <div className="control-item">
            <button
              type="button"
              onClick={() => likeVideo(item)}
              className="control-btn"
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
            >
              <BookmarksIcon fontSize="large" />
            </button>

            <div className="count">{item?.saveCount || 0}</div>
          </div>
        </div>

        <div className="hint">⬆ Scroll for more delicious reels</div>
      </motion.article>
    ));
  };

  return (
    <>
      <motion.div
        className="feed-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Trending Food Reels 🍕</h1>
        <p>Discover delicious moments from food creators</p>
      </motion.div>

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