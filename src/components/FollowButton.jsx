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
          const followerId = currentUser.uid;
          const followDoc = await firestore
            .collection('followers')
            .where('followerId', '==', followerId)
            .where('followedId', '==', userId)
            .get();

          setIsFollowing(!followDoc.empty);
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
// ...

const handleFollow = async () => {
  try {
    const followerId = currentUser.uid;
    const followedId = userId;

    // Fetch the username of the user being followed
    const followedUserSnapshot = await firestore.collection('users').doc(followedId).get();
    const followedUser = followedUserSnapshot.data();
    const followedUsername = followedUser.username;

    // Create a new document in the "followers" collection
    await firestore.collection('followers').doc().set({
      followerId: followerId,
      followedId: followedId,
      followedUsername: followedUsername,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update the user's "following" collection with the followed user's username
    await firestore
      .collection('users')
      .doc(followerId)
      .collection('following')
      .doc(followedId)
      .set({
        followedUsername: followedUsername,
        followedId: followedId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

    setIsFollowing(true);
    console.log('User followed successfully!');
  } catch (error) {
    console.error('Error following user:', error);
  }
};

// ...


  const handleUnfollow = async () => {
    try {
      const followerId = currentUser.uid;
      const followedId = userId;

      // Delete the document representing the follow relationship
      await firestore
        .collection('followers')
        .where('followerId', '==', followerId)
        .where('followedId', '==', followedId)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      // Delete the document in the "following" collection
      await firestore
        .collection('users')
        .doc(followerId)
        .collection('following')
        .doc(followedId)
        .delete();

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
