import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import yicon from '../assets/yicon.jpg';
import { auth } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';  // Update with your path


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
    <header className="flex items-center justify-between">
      <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <img src={yicon} className="mb-4 h-5 w-5" alt="Logo" />
          </Link>
          <button className="navbar-toggle" onClick={toggleMenu}>
            <span className="navbar-toggle-icon"></span>
          </button>
        </div>
      </nav>
      <ul className={`flex items-center space-x-4 text-sm text-blue-200 ${isMenuOpen ? 'open' : ''}`}>
        {user ? (
          <li>
            <h1 className="font-mono text-black">{user.username}</h1>
            <button className='mb-8' onClick={handleSignOut}>Sign Out</button>
          </li>
        ) : (
          <li className="font-mono text-blue-200">
            <Link to="/signin">Sign In</Link>
          </li>
        )}
      </ul>
    </header>
  );
};

export default Header;
