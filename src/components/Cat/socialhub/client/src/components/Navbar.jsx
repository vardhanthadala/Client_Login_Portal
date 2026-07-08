import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar container">
      <div className="navbar-actions">
        <button className="btn btn-login">Log In</button>
        <button className="btn btn-primary">Start for free</button>
      </div>

      <button className="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

export default Navbar;
