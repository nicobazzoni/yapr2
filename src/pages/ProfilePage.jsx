import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase';
import FollowingList from '../components/FollowingList';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = firestore.collection('users').where('username', '==', username);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUser(userData);
          const uid = userSnapshot.docs[0].id;
          fetchUserItems(uid);
          fetchFollowing(uid);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserItems = async (uid) => {
      try {
        const itemsRef = firestore.collection('uploads').where('uid', '==', uid);
        const itemsSnapshot = await itemsRef.get();

        const userItems = [];
        itemsSnapshot.forEach((doc) => {
          const itemData = doc.data();
          userItems.push({ id: doc.id, ...itemData });
        });
        setItems(userItems);
      } catch (error) {
        console.error('Error fetching user items:', error);
      }
    };

    const fetchFollowing = async (uid) => {
      try {
        const followingRef = firestore.collection('following').doc(uid).collection('users');
        const followingSnapshot = await followingRef.get();

        const followingList = followingSnapshot.docs.map((doc) => doc.data());
        setFollowing(followingList);
        console.log('watch', followingList);
      } catch (error) {
        console.error('Error fetching following list:', error);
      }
    };

    fetchUserData();
  }, [username]);

  return (
    <div className="grid md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center items-start mt-10">
      {user && (
        <div className="bg-white shadow-md rounded-md border w-full border-slate-100 p-6">
          <img src={user.photoURL} alt={user.username} className="w-20 h-20 rounded-full mx-auto mb-4" />
          <p className="text-lg text-mono font-bold border rounded-full p-1 justify-center bg-stone-50 mb-1 tracking-widest text-blue-950">
            {user.username}
          </p>
          <p className="text-sm bg-slate-500 border rounded-full text-white">
            <span className="font-bold font-mono mt-2 text-sm"></span> {user.email}
          </p>
        </div>
      )}
  
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 justify-items-center items-start mt-4">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-100 space-y-2 w-full border border-slate-200 rounded-md p-1">
            <div className="h-36 w-full">
              <img src={item.imageUrl} alt={item.username} className="w-full h-full object-cover rounded" />
            </div>
            <p className="text-gray-600 bg-white text-center">{item.message}</p>
            <p className="text-xs mt-1 bg-black text-white text-center">{item.tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
  
  
  
};

export default ProfilePage;
