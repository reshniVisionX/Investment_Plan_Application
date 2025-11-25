import React from "react";
import "../../Styles/Manager/Footer.css";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="big-footer">
      <div className="footer-container">

        <div className="footer-section">
          <h3 className="footer-title">Investment Planning</h3>
          <p className="footer-text">
            A smart and secure platform for managing your wealth through 
            stocks, mutual funds, and real-time analytics.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Quick Links</h4>
          <ul className="footer-list">
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Stocks</a></li>
            <li><a href="#">Mutual Funds</a></li>
            <li><a href="#">Portfolio</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Investments</h4>
          <ul className="footer-list">
            <li><a href="#">Equity Stocks</a></li>
            <li><a href="#">Index Funds</a></li>
            <li><a href="#">Debt Funds</a></li>
            <li><a href="#">Hybrid Funds</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Support</h4>
          <ul className="footer-list">
            <li>Email: support@investmentplan.com</li>
            <li>Phone: +91 98765 43210</li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Documentation</a></li>
          </ul>

          <div className="footer-social">
            <FaFacebook />
            <FaInstagram />
            <FaTwitter />
            <FaLinkedin />
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Investment Planning. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
