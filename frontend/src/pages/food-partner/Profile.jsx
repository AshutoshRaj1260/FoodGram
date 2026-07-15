import React, { useState, useEffect } from "react";
import "../../styles/profile.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import BottomNavBar from "../../components/BottomNavBar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const Profile = () => {
  const userType = localStorage.getItem("userType") || "user";
  const loggedInPartnerId = localStorage.getItem("foodPartnerId");

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);

  const { id } = useParams();

  const isOwner = userType === "partner" && loggedInPartnerId === id;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/food-partner/${id}`, { withCredentials: true })
      .then((response) => {
        setProfile(response.data.foodPartner);
        setVideos(response.data.foodPartner.foodItems || []);
      })
      .catch((err) => {
        console.error("Error fetching food partner profile:", err);
      });
  }, [id]);

  const business = {
    name: "Tasty Bites",
    address: "123 Food Lane, Flavor Town, FT 45678",
    meals: 1240,
    customers: 9870,
  };

  const handleEditClick = (video) => {
    setCurrentVideo(video);
    setEditForm({
      name: video.name,
      description: video.description || "",
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (video) => {
    setCurrentVideo(video);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentVideo) return;
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `/api/food/${currentVideo._id}`,
        {
          name: editForm.name,
          description: editForm.description,
        },
        { withCredentials: true }
      );
      setVideos(
        videos.map((v) =>
          v._id === currentVideo._id ? response.data.foodItem : v
        )
      );
      setEditModalOpen(false);
    } catch (err) {
      console.error("Failed to edit food reel:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentVideo) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`/api/food/${currentVideo._id}`, {
        withCredentials: true,
      });
      setVideos(videos.filter((v) => v._id !== currentVideo._id));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete food reel:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="header-row">
          <div className="avatar" aria-hidden>
            TB
          </div>
          <div className="details">
            <h2 className="business-name">{profile?.businessName}</h2>
            <div className="business-address">{profile?.address}</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div>
              <div className="label">Total meals</div>
              <div className="value">{videos.length || business.meals}</div>
            </div>
            <div className="muted">🍽️</div>
          </div>

          <div className="stat">
            <div>
              <div className="label">Customers served</div>
              <div className="value">{business.customers}</div>
            </div>
            <div className="muted">👥</div>
          </div>
        </div>

        <h3 className="section-title">Reels</h3>
        <div className="reels-grid">
          {videos.map((r) => (
            <div key={r._id} className="reel-thumb">
              <video src={r.video} muted></video>

              {isOwner && (
                <div className="reel-actions-overlay">
                  <button
                    className="action-icon-btn edit-btn"
                    onClick={() => handleEditClick(r)}
                    aria-label="Edit Reel"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    className="action-icon-btn delete-btn"
                    onClick={() => handleDeleteClick(r)}
                    aria-label="Delete Reel"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              )}

              <div className="overlay">
                <span className="mini-btn">Visit</span>
                <span className="mini-btn">❤ {r.likeCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Food Reel</h4>
              <button
                className="modal-close-btn"
                onClick={() => setEditModalOpen(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label htmlFor="edit-name">Meal Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="modal-input"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="edit-description">Description</label>
                  <div className="modal-quill-container">
                    <ReactQuill
                      theme="snow"
                      value={editForm.description}
                      onChange={(val) =>
                        setEditForm((prev) => ({ ...prev, description: val }))
                      }
                      placeholder="Meal description..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Delete Food Reel</h4>
              <button
                className="modal-close-btn"
                onClick={() => setDeleteDialogOpen(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this food reel?</p>
              <p>
                <strong>This action cannot be undone.</strong>
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn secondary"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn danger"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Reel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar userType={userType} />
    </div>
  );
};

export default Profile;
