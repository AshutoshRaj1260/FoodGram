import React, { useEffect, useRef, useState } from "react";
import VideoPlayer from "../../components/VideoPlayer";
import "../../styles/reels.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import BottomNavBar from "../../components/BottomNavBar";
import LikeIcon from "@mui/icons-material/FavoriteBorder";
import BookmarksIcon from "@mui/icons-material/BookmarkBorder";
import ReelSkeleton from "../../components/ReelSkeleton";

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
  const [activeVideoId, setActiveVideoId] = useState(null);
  const containerRef = useRef(null);

  const userType = localStorage.getItem("userType") || "user";

  const { id } = useParams();

  useEffect(() => {
    if (!id || videos.length === 0) return;
    const index = videos.findIndex((v) => v._id === id);
    if (index !== -1) {
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

        if (visibleEntry && visibleEntry.intersectionRatio >= 0.75) {
          setActiveVideoId(visibleEntry.target.dataset.videoId);
        }

        entries.forEach((entry) => {
          const vid = entry.target.querySelector("video");
          if (!vid) return;

          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
            vid.pause();
            vid.removeAttribute("src");
            vid.load();
          }
        });
      },
      {
        root: container,
        rootMargin: "0px",
        threshold: [0, 0.25, 0.75, 1],
      },
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

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    setIsLoading(true);

    axios
      .get(`${apiUrl}/api/food`, { withCredentials: true })
      .then((response) => setVideos(response.data.foodItems))
      .catch((error) => {
        console.error(
          "Failed to fetch food items:",
          error.response?.data || error.message,
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function likeVideo(item) {
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${apiUrl}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true },
      );

      console.log("Like response:", response.data);

      // Update the count using the backend response
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, likeCount: response.data.likeCount } : v,
        ),
      );
    } catch (error) {
      console.error("Like error:", error.response?.data || error.message);
    }
  }

  async function saveVideo(item) {
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${apiUrl}/api/food/save`,
        { foodId: item._id },
        { withCredentials: true },
      );

      console.log("Save response:", response.data);

      // Update the count using the backend response
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, saveCount: response.data.saveCount } : v,
        ),
      );
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
    }
  }

  return (
    <>
      <div className="reel-section">
        <div className="reels" role="list" ref={containerRef}>
          {isLoading ? (
            <ReelSkeleton count={3} />
          ) : (
            videos.map((item) => (
              <article
                className="reel"
                key={item._id}
                role="listitem"
                data-video-id={item._id}
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
                  <div className="description">{item.description}</div>
                  <Link
                    className="visit-btn"
                    to={"/food-partner/" + item.foodPartner}
                  >
                    Visit store
                  </Link>
                </div>

                <div className="controls" aria-hidden>
                  <div className="control-item">
                    <button
                      type="button"
                      onClick={() => likeVideo(item)}
                      className="control-btn"
                      aria-label="Like"
                    >
                      <LikeIcon fontSize="large" />
                    </button>
                    <div className="count">{item.likeCount || 0}</div>
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
                    <div className="count">{item.saveCount || 0}</div>
                  </div>

                  {/* <div className="control-item">
                  <button
                    type="button"
                    className="control-btn"
                    aria-label="Comment"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <div className="count">{item.comments || 0}</div>
                </div> */}
                </div>

                <div className="hint">Scroll to view more</div>
              </article>
            ))
          )}
        </div>
      </div>
      <BottomNavBar userType={userType} />
    </>
  );
};

export default Home;
