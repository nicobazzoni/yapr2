import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';

const FollowerList = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {

    const fetchFollowers = async () => {
        try {
            const followersRef = firestore.collection('followers').where('followedId', '==', userId);
            const followersSnapshot = await followersRef.get();

            const followersData = followersSnapshot.docs.map((doc) => {
                const followerData = doc.data();
                return { followerId: doc.id, ...followerData };
            });

            const fetchUsernamesPromises = followersData.map(async (follower) => {
                const followerUserSnapshot = await firestore.collection('users').doc(follower.followerId).get();
                if (followerUserSnapshot.exists) {
                    const followerUser = followerUserSnapshot.data();
                    return { ...follower, followerUsername: followerUser.username };
                }
                return follower;
            });

            const followersWithUsernames = await Promise.all(fetchUsernamesPromises);

            setFollowers(followersWithUsernames);
            console.log('Followers:', followersWithUsernames);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };
    
   // ...

const fetchFollowing = async () => {
    try {
      const followingRef = firestore.collection('following').where('followerId', '==', userId);
      const followingSnapshot = await followingRef.get();
  
      const followingData = followingSnapshot.docs.map((doc) => {
        const followedData = doc.data();
        return { followedId: doc.id, ...followedData };
      });
  
      const fetchUsernamesPromises = followingData.map(async (followed) => {
        const followedUserSnapshot = await firestore.collection('users').doc(followed.followedId).get();
        if (followedUserSnapshot.exists) {
          const followedUser = followedUserSnapshot.data();
          return { ...followed, followedUsername: followedUser.username };
        }
        return followed;
      });
  
      const followingWithUsernames = await Promise.all(fetchUsernamesPromises);
  
      setFollowing(followingWithUsernames);
      console.log('Following:', followingWithUsernames);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };
  
  // ...
  
    fetchFollowers();
    fetchFollowing();
  }, [userId]);
  

  const fetchUsername = async (uid) => {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        return userData.username;
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }

    return null;
  };

  return (
    <div>
      <h2>Followers:</h2>
      <ul>
        {followers.map(async (follower) => {
          const followerUsername = await fetchUsername(follower.followerId);

          return (
            <li key={follower.followerId}>
              Follower: {followerUsername} | Followed: {follower.followedId}
            </li>
          );
        })}
      </ul>

      <h2>Following:</h2>
      <ul>
        {following.map(async (followed) => {
          const followedUsername = await fetchUsername(followed.followedId);

          return (
            <li key={followed.followedId}>
              Follower: {followed.followerId} | Followed: {followedUsername}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FollowerList;
