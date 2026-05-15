import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <span className="footer-logo-icon">🍽️</span>
              <span className="footer-logo-text">FoodGram</span>
            </div>
            <p className="footer-description">
              A platform where food enthusiasts share, discover, and celebrate culinary excellence.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-links">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#partners">Partners</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Documentation</a>
              </li>
              <li>
                <a href="#">Support</a>
              </li>
              <li>
                <a href="#">Community</a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; 2026 FoodGram. All rights reserved.</p>
          <p>Made with 🍳 for food lovers worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
