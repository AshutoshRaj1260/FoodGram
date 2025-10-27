import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";
import { Link } from "react-router-dom";
import BottomNavBar from "../../components/BottomNavBar";
import { useParams } from "react-router-dom";
import LikeIcon from '@mui/icons-material/FavoriteBorder';
import BookmarksIcon from '@mui/icons-material/BookmarkBorder';;

const Home = () => {
  const [videos, setVideos] = useState([]);
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
    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: [0.5, 0.75, 1.0],
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const vid = entry.target.querySelector("video");
        if (!vid) return;

        if (entry.intersectionRatio >= 0.75) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, options);

    const reels = containerRef.current?.querySelectorAll(".reel") || [];
    reels.forEach((r) => observer.observe(r));

    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    axios
      .get(`${apiUrl}/api/food`, { withCredentials: true })
      .then((response) => setVideos(response.data.foodItems));
  }, []);

  async function likeVideo(item) {
    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await axios.post(
      `${apiUrl}/api/food/like`,
      { foodId: item._id },
      { withCredentials: true }
    );

    if (response.data.like) {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v
        )
      );
    } else {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v
        )
      );
    }
  }

  async function saveVideo(item) {
    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await axios.post(
      `${apiUrl}/api/food/save`,
      { foodId: item._id },
      { withCredentials: true }
    );
    if (response.data.save) {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, saveCount: v.saveCount + 1 } : v
        )
      );
    } else {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, saveCount: v.saveCount - 1 } : v
        )
      );
    }
  }

  return (
    <>
      <div className="reels" role="list" ref={containerRef}>
        {videos.map((item) => (
          <article className="reel" key={item._id} role="listitem">
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
        ))}
      </div>
      <BottomNavBar userType={userType} />
    </>
  );
};

export default Home;
