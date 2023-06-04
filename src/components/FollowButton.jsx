import React, { useState, useEffect, useContext } from 'react';
import { firestore } from '../../firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { RiUserFollowLine, RiUserUnfollowLine } from 'react-icons/ri';
import { AuthContext } from '../contexts/AuthContext';

const FollowButton = ({ userId }) => {
  const { currentUser } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (currentUser) {
          const userRef = firestore.collection('users').doc(currentUser.uid);
          const userSnapshot = await userRef.get();

          if (userSnapshot.exists) {
            const userFollowing = userSnapshot.data().following || [];
            setIsFollowing(userFollowing.includes(userId));
          }
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    const fetchUserData = async () => {
      try {
        const userRef = firestore.collection('users').doc(userId);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    checkFollowStatus();
    fetchUserData();
  }, [currentUser, userId]);

  const handleFollow = async () => {
    try {
      const followerId = currentUser.uid;
      const followedId = userId;

      // Add the followerId to the followed user's "followers" field
      await firestore.collection('users').doc(followedId).update({
        followers: firebase.firestore.FieldValue.arrayUnion(followerId),
      });

      // Add the followedId to the current user's "following" field
      await firestore.collection('users').doc(followerId).update({
        following: firebase.firestore.FieldValue.arrayUnion(followedId),
      });

      setIsFollowing(true);
      console.log('User followed successfully!');
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const followerId = currentUser.uid;
      const followedId = userId;

      // Remove the followerId from the followed user's "followers" field
      await firestore.collection('users').doc(followedId).update({
        followers: firebase.firestore.FieldValue.arrayRemove(followerId),
      });

      // Remove the followedId from the current user's "following" field
      await firestore.collection('users').doc(followerId).update({
        following: firebase.firestore.FieldValue.arrayRemove(followedId),
      });

      setIsFollowing(false);
      console.log('User unfollowed successfully!');
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <div>
      {userData && (
       <></>
      )}
      {isFollowing ? (
        <button className="text-blue-500 hover:text-blue-700" onClick={handleUnfollow}>
          <RiUserUnfollowLine className="inline-block mr-1" />
          Unfollow
        </button>
      ) : (
        <button className="text-blue-500 hover:text-blue-700" onClick={handleFollow}>
          <RiUserFollowLine className="inline-block mr-1" />
          Follow
        </button>
      )}
    </div>
  );
};

export default FollowButton;
