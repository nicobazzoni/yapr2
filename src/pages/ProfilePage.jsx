import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = firestore.collection('users').where('username', '==', username);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserItems = async () => {
        if (user) {
          try {
            const itemsRef = firestore.collection('uploads').where('uid', '==', user.uid);
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
        }
      };
      

    fetchUserData();
    fetchUserItems();
    }, [username, user]);


      

  return (
    <div className="grid grid-cols-1 justify-items-center items-center mt-10">
      {user ? (
        <div className="bg-white shadow-md rounded-md p-6">
          <img src={user.photoURL} alt={user.username} className="w-20 h-20 rounded-full mx-auto mb-4" />
          <p className="text-lg">
            <span className="font-bold">Username:</span> {user.username}
          </p>
          <p className="text-lg">
            <span className="font-bold">Email:</span> {user.email}
          </p>
          <h2 className="text-xl mt-4 font-bold">User Items:</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>{item.title}</li>
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
