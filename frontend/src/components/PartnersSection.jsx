
import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, TrendingUp } from "lucide-react";
import "../styles/partners-section.css";

const PartnersSection = () => {
  const navigate = useNavigate();

  return (
    <section id="partners" className="partners">
      <div className="partners-container">
        <div className="partners-content">
          <h2 className="section-title">Become a Food Partner</h2>
          <p className="partners-description">
            Join our food partner program and reach thousands of food
            enthusiasts. Showcase your expertise, build your brand, and grow
            your audience on FoodGram.
          </p>

          <div className="partner-benefits">
            <div className="benefit-item">
              <Award size={24} />
              <h4>Professional Platform</h4>
              <p>Dedicated tools for food professionals</p>
            </div>
            <div className="benefit-item">
              <TrendingUp size={24} />
              <h4>Growth Opportunities</h4>
              <p>Reach and grow your audience exponentially</p>
            </div>
            <div className="benefit-item">
              <span className="emoji-icon">📊</span>
              <h4>Analytics Dashboard</h4>
              <p>Track performance with detailed insights</p>
            </div>
            <div className="benefit-item">
              <span className="emoji-icon">💰</span>
              <h4>Monetization</h4>
              <p>Earn from your content and influence</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/foodpartner/register")}
            className="btn-partner"
          >
            Become a Partner
          </button>
        </div>

        <div className="partners-visual">
          <div className="partner-card partner-card-1">
            <span>👨‍🍳</span>
          </div>
          <div className="partner-card partner-card-2">
            <span>📹</span>
          </div>
          <div className="partner-card partner-card-3">
            <span>⭐</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
