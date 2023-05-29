import React, { useState, useEffect, useContext } from 'react';
import { firestore } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ReplyForm = ({ itemId,}) => {
  const [replyContent, setReplyContent] = useState('');
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [replies, setReplies] = useState([]);



  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.uid);
    } else {
      setUser(null);
    }
  }, [currentUser]);

  const fetchUserData = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const repliesSnapshot = await firestore
          .collection('items')
          .doc(itemId)
          .collection('replies')
          .get();
        const fetchedReplies = repliesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(fetchedReplies);
        console.log('Fetched Replies:', fetchedReplies);
      } catch (error) {
        console.error('Error fetching replies:', error);
      }
    };
  
    fetchReplies();
  }, [itemId]);
  



  const handleReplySubmit = async (event) => {
    event.preventDefault();
  
    if (!user) {
      console.log('User not signed in');
      return;
    }
  
    try {
      const replyRef = await firestore.collection('items').doc(itemId).collection('replies').add({
        user: user.username,
        uid: user.id,
        content: replyContent,
        timestamp: new Date(),
      });
  
      const newReply = { 
        id: replyRef.id, 
        user: user.username, 
        content: replyContent, 
        timestamp: new Date() 
      };
  
      setReplies(prevReplies => [...prevReplies, newReply]);
      console.log('Reply saved!', newReply)
      setReplyContent('');
  
    } catch (error) {
      console.error('Error saving reply:', error);
    }
   
  };

  useEffect(() => {
    console.log('Replies:', replies);
  }, [replies]);

  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <h2 className="text-xs font-mono text-blue-200 font-bold mb-3">Leave a Reply</h2>
      <form onSubmit={handleReplySubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
         
          <textarea 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="replyContent" 
            value={replyContent} 
            onChange={e => setReplyContent(e.target.value)} 
            placeholder="Type your reply here..."
          />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Submit
          </button>
        </div>
      </form>
      <div className="mt-4">
      <h3 className=" text-blue-300 font-bold mb-2">Replies:</h3>
      {replies.map(reply => (
        
        <div key={reply.id} className="border-b py-2">
          <p className="font-bold">{reply.user}</p>
          <p>{reply.content}</p>
          <p className="text-sm text-gray-500"></p>
        </div>

       
      ))}
     

    </div> 
  </div>
      
    
  );








};

export default ReplyForm;
