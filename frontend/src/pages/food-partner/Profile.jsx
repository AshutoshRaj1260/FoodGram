import React, { useState, useEffect } from "react";
import "../../styles/profile.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import BottomNavBar from "../../components/BottomNavBar";
import PartnerStoryOverlay from "../../components/PartnerStoryOverlay";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const Profile = () => {
  const userType = localStorage.getItem("userType") || "user";

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showStory, setShowStory] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`/api/food-partner/${id}`, { withCredentials: true })
      .then((response) => {
        setProfile(response.data.foodPartner);
        setVideos(response.data.foodPartner.foodItems);
      });
  }, [id]);

  const business = {
    name: "Tasty Bites",
    address: "123 Food Lane, Flavor Town, FT 45678",
    meals: 1240,
    customers: 9870,
  };

  const initials = getInitials(profile?.businessName) || "FP";

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="header-row">
          {/* Clickable avatar — opens story overlay */}
          <button
            className="avatar avatar--clickable"
            onClick={() => setShowStory(true)}
            aria-label={`View ${profile?.businessName ?? "partner"} stories`}
            title="View stories"
          >
            {initials}
          </button>

          <div className="details">
            <h2 className="business-name">{profile?.businessName}</h2>
            <div className="business-address">{profile?.address}</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div>
              <div className="label">Total meals</div>
              <div className="value">{business.meals}</div>
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
              <div className="overlay">
                <span className="mini-btn">Visit</span>
                <span className="mini-btn">❤ 1.2k</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavBar userType={userType} />

      {showStory && (
        <PartnerStoryOverlay
          partnerId={id}
          partnerInitials={initials}
          onClose={() => setShowStory(false)}
        />
      )}
    </div>
  );
};

export default Profile;