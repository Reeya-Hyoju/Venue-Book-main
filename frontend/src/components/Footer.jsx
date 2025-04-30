import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import "../styles/Footer.css";

const Footer = () => {
  // Check if the user is logged in based on a stored token
  const token = localStorage.getItem("access");

  // Optional: function to alert the user if they're not logged in
  const handleBrowseClick = () => {
    if (!token) {
      alert("Please login first.");
    }
  };

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="footer-grid">
          {/* Company Info */}
          <div>
            <h3 className="footer-title">EventSpace</h3>
            <p className="footer-description">
              Find and book the perfect venue for your next event.
            </p>
            <div className="footer-contact">
              <Phone size={18} className="footer-icon" />
              <span>9873647328</span>
            </div>
            <div className="footer-contact">
              <Mail size={18} className="footer-icon" />
              <span>contact@venuefinder.com</span>
            </div>
            <div className="footer-contact">
              <MapPin size={18} className="footer-icon" />
              <span>123 Venue Street, City</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="link">
                  Home
                </Link>
              </li>
              <li>
                {/* Conditional navigation for "Browse Venues" */}
                <Link
                  to={token ? "/venue" : "/login"}
                  onClick={!token ? handleBrowseClick : undefined}
                  className="link"
                >
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link to="/register-venue" className="link">
                  List Your Venue
                </Link>
              </li>
              <li>
                <Link to="/about" className="link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Venue Categories */}
          <div>
            <h3 className="footer-title">Venue Types</h3>
            <ul className="footer-links">
              <li>
                <Link to="/venue?type=wedding" className="link">
                  Wedding Venues
                </Link>
              </li>
              <li>
                <Link to="/venue?type=conference" className="link">
                  Conference Halls
                </Link>
              </li>
              <li>
                <Link to="/venue?type=party" className="link">
                  Party Spaces
                </Link>
              </li>
              <li>
                <Link to="/venue?type=outdoor" className="link">
                  Outdoor Locations
                </Link>
              </li>
              <li>
                <Link to="/venue?type=studio" className="link">
                  Studio Spaces
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-copy">
          © {new Date().getFullYear()} Venue Finder. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
