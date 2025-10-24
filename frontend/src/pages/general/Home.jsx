import React, { useEffect, useRef, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const containerRef = useRef(null);

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
      .then((response) => setVideos(response.data.foodItems))
      .catch(() => {
        // fallback sample content when backend isn't available during dev
        setVideos([
          {
            _id: "1",
            video:
              "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description:
              "Fresh biryani made daily. Try our chef specials today!",
            likes: 23,
            bookmarks: 12,
            comments: 45,
            foodPartner: "1",
          },
          {
            _id: "2",
            video:
              "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description:
              "Quick delivery across the city. Hot, tasty, and ready in minutes.",
            likes: 9,
            bookmarks: 3,
            comments: 5,
            foodPartner: "2",
          },
        ]);
      });
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

  async function saveVideo(item){

    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await axios.post(
      `${apiUrl}/api/food/save`,
      { foodId: item._id },
      { withCredentials: true }
    );
      if(response.data.save){
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
                <button type="button" onClick={() => likeVideo(item)} className="control-btn" aria-label="Like">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 21s-7.5-4.35-10-7.02C-0.34 10.67 2.33 6 6.5 6c2.24 0 3.78 1.09 4.5 2.05C11.72 7.09 13.26 6 15.5 6 19.67 6 22.34 10.67 22 13.98 19.5 17.65 12 21 12 21z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <div className="count">{item.likeCount || 0}</div>
              </div>

              <div className="control-item">
                <button type="button" onClick={() => saveVideo(item)} className="control-btn" aria-label="Save">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 2h12v20l-6-4-6 4V2z" fill="currentColor" />
                  </svg>
                </button>
                <div className="count">{item.saveCount || 0}</div>
              </div>

              <div className="control-item">
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
              </div>
            </div>

            <div className="hint">Scroll to view more</div>
          </article>
        ))}
      </div>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        <div className="nav-inner">
          <Link to="/" aria-label="Home" className="nav-link">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z"
                fill="currentColor"
              />
            </svg>
            <span>home</span>
          </Link>
          <Link to="/saved" aria-label="Saved" className="nav-link">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 2h12v20l-6-4-6 4V2z" fill="currentColor" />
            </svg>
            <span>saved</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Home;
