import React, { useState, useEffect, useRef } from "react";
import "../../styles/profile.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import BottomNavBar from "../../components/BottomNavBar";
import PartnerStoryOverlay from "../../components/Partnerstoryoverlay";

const API_URL = import.meta.env.VITE_API_URL || "";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AddStoryModal = ({ onClose, onSuccess }) => {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const inputRef = useRef(null);

  const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm";
  const MAX_MB   = 50;

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    setError("");

    if (chosen.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum is ${MAX_MB} MB.`);
      return;
    }

    const isVideo = chosen.type.startsWith("video/");
    const isImage = chosen.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setError("Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, MOV, or WebM.");
      return;
    }

    setFile(chosen);
    setPreviewType(isVideo ? "video" : "image");
    setPreview(URL.createObjectURL(chosen));
  };

  const handleUpload = async () => {
    if (!file) { setError("Please choose a file first."); return; }

    const formData = new FormData();
    formData.append("media", file);
    setUploading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/api/stories/partner`, formData, {
        withCredentials: true,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className="story-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Add story">
      <div className="story-modal" onClick={(e) => e.stopPropagation()}>
        <div className="story-modal__header">
          <h2 className="story-modal__title">Add a Story</h2>
          <button className="story-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="story-modal__hint">
          Stories expire after <strong>24 hours</strong>. Share an image or short video clip.
        </p>

        <div
          className={`story-modal__dropzone${preview ? " story-modal__dropzone--has-preview" : ""}`}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Choose file"
        >
          {preview ? (
            previewType === "video" ? (
              <video className="story-modal__preview" src={preview} muted playsInline controls />
            ) : (
              <img className="story-modal__preview" src={preview} alt="Story preview" />
            )
          ) : (
            <div className="story-modal__placeholder">
              <span className="story-modal__placeholder-icon">📷</span>
              <span className="story-modal__placeholder-text">Click to choose a photo or video</span>
              <span className="story-modal__placeholder-sub">
                JPEG · PNG · WebP · GIF · MP4 · MOV · WebM — max {MAX_MB} MB
              </span>
            </div>
          )}
        </div>

        <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: "none" }} onChange={handleFileChange} />

        {preview && (
          <button className="story-modal__change-btn" onClick={() => inputRef.current?.click()}>
            Change file
          </button>
        )}

        {error && <p className="story-modal__error" role="alert">{error}</p>}

        <div className="story-modal__actions">
          <button className="story-modal__cancel" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="story-modal__submit" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? <span className="story-modal__spinner" /> : "Post Story"}
          </button>
        </div>
      </div>
    </div>
  );
};


const Profile = () => {
  const userType          = localStorage.getItem("userType") || "user";
  const loggedInPartnerId = localStorage.getItem("partnerId") || null;

  const [profile, setProfile]       = useState(null);
  const [videos, setVideos]         = useState([]);
  const [showStory, setShowStory]   = useState(false);
  const [showAddStory, setShowAddStory] = useState(false);
  const [stories, setStories]       = useState([]);

  const { id } = useParams();

  const isOwnProfile = userType === "partner" && (loggedInPartnerId === id || !loggedInPartnerId);

  const refreshStories = () =>
    axios
      .get(`${API_URL}/api/stories/partner/${id}`)
      .then((res) => setStories(res.data.stories || []))
      .catch(() => setStories([]));

  useEffect(() => {
    axios
      .get(`${API_URL}/api/food-partner/${id}`, { withCredentials: true })
      .then((res) => {
        setProfile(res.data.foodPartner);
        setVideos(res.data.foodPartner.foodItems || []);
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => { refreshStories(); }, [id]);

  const initials        = profile ? (getInitials(profile.businessName) || "FP") : "…";
  const hasActiveStories = stories.length > 0;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="header-row">
          <div className="avatar-stack">
            <button
              className={`avatar avatar--clickable${hasActiveStories ? " avatar--has-story" : ""}`}
              onClick={() => setShowStory(true)}
              aria-label={`View ${profile?.businessName ?? "partner"} stories`}
              title="View stories"
            >
              {initials}
            </button>

            {isOwnProfile && (
              <button
                className="avatar-add-story"
                onClick={() => setShowAddStory(true)}
                aria-label="Add story"
                title="Add story"
              >
                +
              </button>
            )}
          </div>

          <div className="details">
            <h2 className="business-name">{profile?.businessName ?? "Loading…"}</h2>
            <div className="business-address">{profile?.address}</div>
            {isOwnProfile && (
              <button className="add-story-text-btn" onClick={() => setShowAddStory(true)}>
                + Add Story
              </button>
            )}
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div>
              <div className="label">Total reels</div>
              <div className="value">{videos.length}</div>
            </div>
            <div className="muted">🍽️</div>
          </div>
          <div className="stat">
            <div>
              <div className="label">Active stories</div>
              <div className="value">{stories.length}</div>
            </div>
            <div className="muted">📖</div>
          </div>
        </div>

        <h3 className="section-title">Reels</h3>
        {videos.length === 0 ? (
          <p className="reels-empty">No reels yet.</p>
        ) : (
          <div className="reels-grid">
            {videos.map((r) => (
              <div key={r._id} className="reel-thumb">
                <video src={r.video} muted playsInline preload="metadata" />
                <div className="overlay">
                  <span className="mini-btn">{r.name}</span>
                  <span className="mini-btn">❤ {r.likeCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar userType={userType} />

      {showStory && (
        <PartnerStoryOverlay
          partnerId={id}
          partnerInitials={initials}
          onClose={() => setShowStory(false)}
        />
      )}

      {showAddStory && (
        <AddStoryModal
          onClose={() => setShowAddStory(false)}
          onSuccess={refreshStories}
        />
      )}
    </div>
  );
};

export default Profile;