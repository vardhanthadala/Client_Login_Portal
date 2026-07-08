import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer mt-12">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">S</span>
            <span className="logo-text">SocialHub</span>
          </div>
          <p className="text-muted mt-4">
            The easiest way to manage your social media presence and publish content everywhere simultaneously.
          </p>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h4 className="font-semibold mb-4">Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#integrations">Integrations</a></li>
            </ul>
          </div>
          <div className="link-group">
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#guides">Guides</a></li>
              <li><a href="#help">Help Center</a></li>
            </ul>
          </div>
          <div className="link-group">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom container mt-8 pt-4">
        <p className="text-muted text-sm">&copy; {new Date().getFullYear()} SocialHub. All rights reserved.</p>
        <div className="social-links">
          <a href="#twitter">Twitter</a>
          <a href="#linkedin">LinkedIn</a>
          <a href="#github">GitHub</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
