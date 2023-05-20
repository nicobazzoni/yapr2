import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import yicon from '../assets/yicon.jpg';
import { auth, firestore } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';  // Update with your path
import {RiHomeLine} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
   // Update with your path
  

const location = useLocation();
const navigate = useNavigate(); 

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
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        console.log('User Data:', userData); // Log user data to the console
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });


    return () => unsubscribe();
  }, []);

   const backHome = () => {
    navigate('/');
  };
   

  return (
    <header className="flex items-center mb-3 justify-between"  style={{ backgroundImage: `url(${yicon})` }}>
      <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
      <div className="navbar-brand flex items-center">
  {user ? (
    location.pathname === '/form' || location.pathname.startsWith('/details/') || location.pathname.startsWith('/profile/') ? 
    <RiHomeLine className="text-black" onClick={backHome} /> : 
    <h1 className="font-mono text-black">{user.username}</h1>
  ) : null}
  <button className="navbar-toggle" onClick={toggleMenu}>
    <span className="navbar-toggle-icon"></span>
  </button>
</div>
      </nav>
      <ul className={`flex items-center space-x-4 text-sm text-blue-500 ${isMenuOpen ? 'open' : ''}`}>
        {user ? (
          <li>
            <button className='' onClick={handleSignOut}>Sign Out</button>
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
