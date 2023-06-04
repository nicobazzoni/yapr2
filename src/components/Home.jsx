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
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { uid } = useParams();

  const fetchUserData = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();
  
      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        console.log('User Data:', userData); // Log user data to the console
        setUser({ id: userSnapshot.id, ...userData });
  
        if (userData?.following && userData.following.length > 0) {
          console.log('User is following:', userData.following); // Log following user IDs
          const audioFilesData = await fetchAudioFilesFromFollowedUsers(userData.following);
          console.log('Fetched audio files:', audioFilesData); // Log fetched audio files
          setAudioFiles(audioFilesData);
        } else {
          console.log('User is not following anyone');
          setAudioFiles([]);
        }
      } else {
        console.log('User does not exist');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  

  const fetchAudioFilesFromFollowedUsers = async (userIds) => {
    let audioFilesData = [];
    for (let userId of userIds) {
      const audioFilesSnapshot = await firestore.collection('audioFiles')
        .where('uid', '==', userId) // revised 'userId' to 'uid'
        .orderBy('createdAt', 'desc') // revised 'timestamp' to 'createdAt' as per your provided fields
        .get();
      
      audioFilesSnapshot.forEach(doc => {
        audioFilesData.push({
          id: doc.id,
          ...doc.data()
        });

        console.log(doc.data());
      });
    }
  
    return audioFilesData;
};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
        setAudioFiles([]);
      }
    });

    return () => unsubscribe();
  }, []);

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
          
          </button>
        </div>
        <h1 className='text-xl font-bold font-mono text-slate-200 text-center'>Yapr</h1>
        <h1 className="text-xs font-bold text-start font-mono text-blue-200 border-b mb-2">yaps</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
   
    {audioFiles.map((audioFile) => (
      <div key={audioFile.id} className="bg-slate-100 space-y-2 w-full border border-slate-200 rounded-md p-1">
        <p className="text-gray-600 bg-white text-center">{audioFile.tag}</p>
        <p className=" bg-black text-blue-100 text-center">{audioFile.username}</p>
        <p className="text-gray-600 bg-white text-xs text-center">{audioFile.createdAt.toDate().toLocaleDateString()}</p>
        <img src={audioFile.image} alt={audioFile.username} className="w-full h-72 object-cover rounded" />
        <audio src={audioFile.url} controls className="w-full"></audio>
      </div>
    ))}
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
