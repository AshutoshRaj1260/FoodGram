import React, { useEffect, useState } from "react";
import "../../styles/reels.css";
import axios from "axios";

const Saved = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {

    const apiUrl = import.meta.env.VITE_API_URL;

    axios
      .get(`${apiUrl}/api/food/save`, { withCredentials: true })
      .then((response) => {
        const savedFoods = response.data.savedFoods.map((item) => ({
          _id: item.food._id,
          video: item.food.video,
          description: item.food.description,
          likeCount: item.food.likeCount,
          saveCount: item.food.saveCount,
          foodPartner: item.food.foodPartner,
        }));
        setVideos(savedFoods);
      });
  }, []);

  const removeSaved = async (item) => {
    try {
      await axios.post(
        "http://localhost:3000/api/food/save",
        { foodId: item._id },
        { withCredentials: true }
      );
      setVideos((prev) => prev.filter((v) => v._id !== item._id));
    } catch {}
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "var(--bg)" }}>
      <h2 style={{ color: "var(--text)", marginBottom: 12 }}>Saved</h2>
      {videos.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>You haven't saved anything yet.</p>
      ) : (
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {videos.map((item) => (
            <div
              key={item._id}
              style={{
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                background: "#000",
                height: 180,
              }}
            >
              <video
                src={item.video}
                muted
                loop
                autoPlay
                onClick={(e) => e.target.requestFullscreen()}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
              <button
                onClick={() => removeSaved(item)}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
