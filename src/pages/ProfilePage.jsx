import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase';



const ProfilePage = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
  
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
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const userRef = firestore.collection('users').where('username', '==', username);
          const userSnapshot = await userRef.get();
  
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            const uid = userSnapshot.docs[0].id;
            setUser(userData);
            fetchUserItems(uid); // Call fetchUserItems with uid parameter
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      fetchUserData();
    }, [username]);
  
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center items-center mt-10">
        {user ? (
          <div className="bg-white shadow-md rounded-md p-6">
            <img src={user.photoURL} alt={user.username} className="w-20 h-20 rounded-full mx-auto mb-4" />
            <p className="text-lg">
               {user.username}
            </p>
            <p className="text-lg">
              <span className="font-bold">Email:</span> {user.email}
            </p>
            <h2 className="text-xl mt-4 font-bold"><span className='text-blue-200'>{user.username}'s </span> yaps:</h2>
            <ul>
              {items.map((item) => (
                <li key={item.id} className="bg-slate-100 space-y-2 rounded-md p-4 my-2">
                  <div className="flex items-center justify-center">
                    <img src={item.imageUrl} alt={item.username} className="w-20 h-20 " />
                  
                  </div>
                  <p className="text-gray-600 bg-white ">{item.message}</p>
                  <p className="text-gray-500 text-xs mt-1"> {item.tag}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-lg">User not found.</p>
        )}
      </div>
    );
  };
  
  export default ProfilePage;
  