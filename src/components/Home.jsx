import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../firebase';
import UploadForm from './Form';
import Feed from './PostList';
import yicon from '../assets/yicon.jpg';


const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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



  const goToSignUp = () => {
    navigate('/signup');
    };

    const goToForm = () => {
        navigate('/form');
        };



        return (
            <div className="m-4">
              {user ? (
                <div className="flex flex-col items-center">
                  <div className="flex justify-between items-center w-full">
                    <button 
                      className='bg-whitesmoke border p-3 rounded-full' 
                      onClick={goToForm}
                    >
                      <i class="fas fa-plus"></i> {/* FontAwesome icon for "+" */}
                    </button>
                    <p className="font-mono font-bold">{user.username}</p>
                    {/* Some action or avatar can be added on the right */}
                  </div>
                  <div className="mt-4">
                    <Feed user={user} />
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center space-y-4'>
                  <h1 className='text-3xl font-bold font-mono'>Welcome to Yapr</h1>
                  <button 
                    className='bg-whitesmoke border p-2 rounded-full' 
                    onClick={goToSignUp}
                  >
                    Sign Up
                  </button>
                  <img className="h-50 w-50" src={yicon} alt='yicon' />
                </div>
              )}
            </div>
          );
        };

export default Home;
