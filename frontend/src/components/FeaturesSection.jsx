import React from "react";
import { Heart, Share2, TrendingUp, Users } from "lucide-react";
import "../styles/features-section.css";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Heart size={32} />,
      title: "Like & Save",
      description: "Express your love for recipes and save them for later with just a click.",
    },
    {
      icon: <Share2 size={32} />,
      title: "Share Your Creations",
      description: "Upload your food recipes and connect with food enthusiasts worldwide.",
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Trending Now",
      description: "Discover the most popular recipes trending on FoodGram right now.",
    },
    {
      icon: <Users size={32} />,
      title: "Join Community",
      description: "Connect with chefs, home cooks, and food lovers in our vibrant community.",
    },
  ];

  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">Why Choose FoodGram?</h2>
          <p className="section-subtitle">
            Explore the features that make FoodGram your favorite food platform
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
