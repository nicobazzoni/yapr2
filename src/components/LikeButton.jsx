import React, { useState, useEffect, useContext } from 'react';
import { firestore } from '../../firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { FaHeart } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const LikeButton = ({ uploadId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [likedUsers, setLikedUsers] = useState([]);
  const [likedUsernames, setLikedUsernames] = useState([]); 
  const [ user, setUser] = useState(null);

  useEffect(() => {
    const fetchLikes = async (itemId) => {
      try {
        const likesRef = firestore.collection('uploads').doc(itemId).collection('likes');
        const likesSnapshot = await likesRef.get();
        const likesCount = likesSnapshot.size;
        setLikes(likesCount);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };




    const fetchLikedUsers = async (itemId) => {
      try {
        const likesRef = firestore.collection('uploads').doc(itemId).collection('likes');
        const likesSnapshot = await likesRef.get();
        const likedUsersData = likesSnapshot.docs.map((doc) => doc.id);
        setLikedUsers(likedUsersData);
      } catch (error) {
        console.error('Error fetching liked users:', error);
      }
    };

    const checkUserLikeStatus = async () => {
      try {
        const userId = currentUser?.uid;
        const likesRef = firestore.collection('uploads').doc(uploadId).collection('likes');
        const userLikeDoc = await likesRef.doc(userId).get();
        const userLiked = userLikeDoc.exists;
        setIsLiked(userLiked);
      } catch (error) {
        console.error('Error checking user like status:', error);
      }
    };

    const unsubscribe = firestore
      .collection('uploads')
      .doc(uploadId)
      .collection('likes')
      .onSnapshot((snapshot) => {
        const likesCount = snapshot.size;
        setLikes(likesCount);
      });

    fetchLikes(uploadId);
    fetchLikedUsers(uploadId);
    checkUserLikeStatus();

    return () => {
      unsubscribe();
    };
  }, [currentUser, uploadId]);

  const fetchUsername = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
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

  useEffect(() => {
    const fetchLikedUsernames = async () => {
      const usernames = await Promise.all(likedUsers.map((userId) => fetchUsername(userId)));
      setLikedUsernames(usernames);
    };

    fetchLikedUsernames();
  }, [likedUsers]);

  const handleLike = async () => {
    try {
      const userId = currentUser?.uid;
      const likesRef = firestore.collection('uploads').doc(uploadId).collection('likes');
  
      if (isLiked) {
        // If already liked, remove the like
        await likesRef.doc(userId).delete();
        setIsLiked(false);
  
        // Remove the liked post from the user's likedPosts array
        setUser((prevUser) => ({
          ...prevUser,
          likedPosts: prevUser && prevUser.likedPosts ? prevUser.likedPosts.filter((postId) => postId !== uploadId) : [],
        }));
      } else {
        // If not liked, add the like
        await likesRef.doc(userId).set({});
  
        // Fetch the liked post data
        const likedPostRef = firestore.collection('uploads').doc(uploadId);
        const likedPostSnapshot = await likedPostRef.get();
        const likedPostData = likedPostSnapshot.data();
  
        // Add the liked post to the user's likedPosts array
        setUser((prevUser) => ({
          ...prevUser,
          likedPosts: prevUser && prevUser.likedPosts ? [...prevUser.likedPosts, likedPostData] : [likedPostData],
        }));
  
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking item:', error);
    }
  };
  
  return (
    <div className="flex space-x-2 items-center">
      <FaHeart
        size={15}
        className={`cursor-pointer transition-colors duration-300 ${
          isLiked ? 'text-rose-200' : 'text-gray-400'
        }`}
        onClick={handleLike}
      />
      <span style={{ fontSize: 10 }} className="ml-2 text-sm">
        {likes}
      </span>
      <div className="flex text-xs space-x-2">
        {likedUsernames.length > 0 ? (
          likedUsernames.map((username) => <p key={username}>{username} </p>)
        ) : (
          <p>No likes yet</p>
        )}
      </div>
    </div>
  );
};

export default LikeButton;
