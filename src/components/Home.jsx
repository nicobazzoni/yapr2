import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../firebase';
import UploadForm from './Form';
import Feed from './PostList';
import yicon from '../assets/yicon.jpg';
import { useParams } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { uid } = useParams();
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
            <div className="flex justify-center items-center min-h-screen">
                {user ? (
                    <div className='items-center'>
                        <div>
                            <button
                                className='bg-whitesmoke border p-3 h-10 w-10 rounded-full bg-contain bg-center bg-no-repeat  hover:animate-pulse' 
                                onClick={goToForm}
                                style={{ backgroundImage: `url(${yicon})` }}
                            >
                                {/* Button Content */}
                            </button>
                        </div>
                      
                        <div>
                             <Feed uid={uid} />   
                        </div>
                    </div>
                ) : (
                    <div className='flex-col justify-items-center'>
                        <h1 className='text-3xl font-bold font-mono text-center'>Welcome to Yapr</h1>
                        <button  className='bg-whitesmoke border rounded-full p-2' onClick={goToSignUp}>Sign Up</button>
                        <img className="h-50 w-50" src={yicon} alt='yicon' />
                    </div>
                )}
            </div>
        );
    };
        

export default Home;
