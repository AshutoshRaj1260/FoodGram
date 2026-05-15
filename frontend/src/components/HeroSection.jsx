import React from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Play } from "lucide-react";
import "../styles/hero-section.css";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-container">
        {/* Left Side - Text */}
        <div className="hero-content">
          <div className="hero-badge">
            <ChefHat size={16} />
            <span>Culinary Excellence</span>
          </div>

          <h1 className="hero-title">
            Share Your Culinary Masterpieces
          </h1>

          <p className="hero-description">
            Discover, create, and share delicious food recipes with a vibrant community of food enthusiasts. FoodGram brings your kitchen to life.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/user/register")}
              className="btn-primary"
            >
              Get Started
            </button>
            <button className="btn-secondary">
              <Play size={18} />
              Explore Recipes
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">2K+</span>
              <span className="stat-label">Recipes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Interactions</span>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hero-visual">
          <div className="hero-cards">
            <div className="food-card card-1">
              <span className="card-emoji">🍕</span>
              <p>Italian Delights</p>
            </div>
            <div className="food-card card-2">
              <span className="card-emoji">🍜</span>
              <p>Asian Fusion</p>
            </div>
            <div className="food-card card-3">
              <span className="card-emoji">🍔</span>
              <p>Comfort Food</p>
            </div>
            <div className="food-card card-4">
              <span className="card-emoji">🥗</span>
              <p>Healthy Bites</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
