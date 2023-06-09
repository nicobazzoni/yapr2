import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase';
import LikeButton from '../components/LikeButton';
import BioForm from '../components/BioForm';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState('');
  const [followers, setFollowers] = useState([]);
const [following, setFollowing] = useState([]);


  const { currentUser } = useContext(AuthContext);

  const fetchUserData = async () => {
    try {
      const userRef = firestore.collection('users').where('username', '==', username);
      const userSnapshot = await userRef.get();
  
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setUser(userData);
        const uid = userSnapshot.docs[0].id;
        await Promise.all([
          fetchUploads(uid), 
          fetchAudioFiles(uid),
          fetchFollowers(uid),
          fetchFollowing(uid)
        ]);
      }
      
      

      
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUpdatedUserData = () => {
    // Fetch updated user data every 10 seconds
    setInterval(fetchUserData, 10000);
  };

  useEffect(() => {
    fetchUserData();
    fetchUpdatedUserData();
  }, [username]);

  

  const fetchUploads = async (uid) => {
    try {
      const uploadsRef = firestore.collection('uploads').where('uid', '==', uid);
      const uploadsSnapshot = await uploadsRef.get();

      const userUploads = uploadsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploads(userUploads);
    } catch (error) {
      console.error('Error fetching user uploads:', error);
    }
  };

  const fetchAudioFiles = async (uid) => {
    try {
      const audioFilesRef = firestore.collection('audioFiles').where('uid', '==', uid);
      const audioFilesSnapshot = await audioFilesRef.get();
  
      const userAudioFiles = audioFilesSnapshot.docs.map((doc) => {
        const audioFileData = doc.data();
        const { image, createdAt, url, tag } = audioFileData; // Destructure the photoUrl and createdAt properties
        return {
          id: doc.id,
          image, // Include the photoUrl property in the object
          createdAt,
          url,
          tag, // Include the createdAt property in the object
        
        };
      });
  
      setAudioFiles(userAudioFiles);
      console.log('audio', userAudioFiles);
    } catch (error) {
      console.error('Error fetching user audio files:', error);
    }
  };
  

  useEffect(() => {
    fetchUserData();
  }, [username]);


  const handleBioFormSubmit = async (newBio, newMood) => {
    try {
      const userRef = firestore.collection('users').doc(user.id);
  
      await userRef.update({ bio: newBio, mood: newMood });
      setBio(newBio);
      setMood(newMood);
  
      // Update the user object with the new bio and mood values
      setUser((prevUser) => ({
        ...prevUser,
        bio: newBio,
        mood: newMood
      }));
  
      // Delay fetching the updated user data
      setTimeout(() => {
        fetchUserData();
      }, 1000); // Adjust the delay time as needed
  
      // Show success toast message
      toast.success('User data updated successfully!', {
        position: toast.POSITION.TOP_RIGHT,
      });
  
      // Refresh the page
      setTimeout(() => {
        fetchUserData();
      }, 1000); // Adjust the delay time as needed
      
    } catch (error) {
      console.error('Error updating user data:', error);
      // Show error toast message
      toast.error('Error updating user data. Please try again.', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  

  const fetchFollowers = async (uid) => {
    const followersRef = firestore.collection('users').where('followers', 'array-contains', uid);
    const followersSnapshot = await followersRef.get();
    console.log(followersSnapshot.docs);
    const followerData = followersSnapshot.docs.map(doc => doc.data());
    setFollowers(followerData);
    console.log('followers', followerData);
  };
  
  const fetchFollowing = async (uid) => {
    const followingRef = firestore.collection('users').where('following', 'array-contains', uid);
    const followingSnapshot = await followingRef.get();
    console.log(followingSnapshot.docs);
    const followingData = followingSnapshot.docs.map(doc => doc.data());
    setFollowing(followingData);
    console.log('following', followingData);
  };
  
  
  
  

  const isProfileOwner = currentUser && currentUser.uid === uploads[0]?.uid;


  return (
    <div className="justify-items-center  items-start mt-10">
      {user && uploads.length > 0 && (
        <div className="bg-white shadow-md rounded-md border w-full border-slate-100 p-6">
          <img src={uploads[0]?.photoUrl} alt={user.username} className="w-20 h-20 rounded-full mx-auto mb-4" />
          <p className="text-lg text-mono font-bold border rounded-full p-1 justify-center bg-stone-50 mb-1 tracking-widest text-blue-950">
            {uploads[0]?.username}
          </p>
          <p className="text-sm bg-slate-500 border rounded-full text-white">
            <span className="font-bold font-mono mt-2 text-sm"></span> {user.email}
          </p>
          
          <div className="border-t mt-2 text-center">
            <p className="font-mono text-xs border-b">{user.bio}</p>
            <div className="flex justify-center items-center  my-4">
              <p className="font-mono border font-extrabold bg-blue-100 animate p-4">{user.mood}</p>
            </div>
          </div>
          

          {isProfileOwner && (
            <BioForm
              username={username}
              currentUser={currentUser}
              initialBio={bio}
              initialMood={mood}
              onSubmit={handleBioFormSubmit}
              isProfileOwner={isProfileOwner}
            />
          )}
        </div>
      )}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 justify-items-center items-start mt-4">
        {uploads.map((upload) => (
          <div key={upload.id} className="bg-slate-100 space-y-2 w-full border border-slate-200 rounded-md p-1">
            <div className="h-36 w-full">
              <img src={upload.imageUrl} alt={upload.username} className="w-full h-full object-cover rounded" />
            </div>
            <p className="text-gray-600 bg-white text-center">{upload.message}</p>
            <p className="text-xs mt-1 bg-black text-white text-center">{upload.tag}</p>
            <LikeButton initialLikes={upload.likes} uploadId={upload.id} user={user} />
            {upload.likes && upload.likes.length > 0 && (
              <div className="flex justify-center mt-1">
                <span className="text-gray-600 font-mono text-sm">Liked by: </span>
                {upload.likes.map((like, index) => (
                  <span key={index} className="text-blue-500 font-mono text-sm">
                    {like}
                    {index < upload.likes.length - 1 && <span className="text-gray-600">, </span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div> 

      <div className="mt-8">
  <h2 className="text-2xl font-bold mb-4 bg-rose-400"> <span className='text-white'>{user && user.username}'s</span>  Yaps</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
    {audioFiles.map((audioFile) => (
      <div key={audioFile.id} className="bg-slate-100 space-y-2 w-full border border-slate-200 rounded-md p-1">
        <p className="text-gray-600 bg-white text-center">{audioFile.tag}</p>
        <p className="text-gray-600 bg-white text-center">{audioFile.createdAt.toDate().toLocaleDateString()}</p>
        <img src={audioFile.image} alt={audioFile.username} className="w-full h-72 object-cover rounded" />
        <audio src={audioFile.url} controls className="w-full"></audio>
      </div>
    ))}
  </div>
</div>

{user && (
  <div className='space-x-2'>
    <h1 className='font-mono bg-black mt-4 text-white mb-2'>Listening list</h1>
    <div className='flex justify-between items-center'> 
      <div className=''>
        <h2 className='border rounded-md p-2 font-serif tracking-wider bg-white'> {user.username}'s Listeners</h2>
        <ul className='mt-2 border-b border-black '>
          {followers.map(follower => (
            <li className='  border-black mb-1 font-mono tracking-widest font-bold bg-blue-100'  key={follower.id}>
            <Link className='hover:bg-blue-200 p-2  ' to={`/profile/${follower.username}`}>{follower.username}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className='border rounded-md font-serif tracking-wider p-1 bg-white'> {user.username} Listens to</h2>
        <ul className='mt-2 border-b border-black '>
          {following.map(following => (
            <li className='  border-black font-mono tracking-widest mb-1 font-bold bg-blue-100' key={following.id}> 
              <Link className='hover:bg-blue-200 p-2 ' to={`/profile/${following.username}`}>{following.username}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default ProfilePage;
