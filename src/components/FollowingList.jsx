import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';

const FollowingList = ({ userId }) => {
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        const followersRef = firestore.collection('followers').doc(userId);
        const followersSnapshot = await followersRef.get();

        if (followersSnapshot.exists) {
          const followersData = followersSnapshot.data();
          setFollowers(followersData.followers);
        }
      } catch (error) {
        console.error('Error fetching followers data:', error);
      }
    };

    fetchFollowersData();
    console.log('followers', followers);
  }, [userId]);

  return (
    <div>
      <h2>Followers:</h2>
      <ul>
        {followers.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default FollowingList;
