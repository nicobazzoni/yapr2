import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import yicon from '../assets/yicon.jpg';
import { auth } from '../../firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    auth.signOut().then(() => {
      // Additional actions upon sign out
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="flex justify-items-center relative">
      <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <img src={yicon} className="mb-4 h-5 w-5" alt="Logo" />
          </Link>
          <button className="navbar-toggle" onClick={toggleMenu}>
            <span className="navbar-toggle-icon"></span>
          </button>
        </div>
        <ul className={`navbar-menu font-mono text-sm text-blue-200 ${isMenuOpen ? 'open' : ''}`}>
          {user ? (
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          ) : (
            <li className="font-mono text-blue-200">
              <Link to="/signin">Sign In</Link>
            </li>
          )}
        </ul>
      </nav>
   
    </header>
  );
};

export default Header;
